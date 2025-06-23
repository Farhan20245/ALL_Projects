import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JobWithCompany } from "@shared/schema";
import type { ApplicationFormData } from "@/types";

interface ApplicationModalProps {
  job: JobWithCompany | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationModal({ job, isOpen, onClose }: ApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    jobId: 0,
    coverLetter: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return await apiRequest('POST', '/api/applications', data);
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      jobId: 0,
      coverLetter: '',
    });
    setResumeFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume to continue.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you'd upload the file first and get a URL
    // For now, we'll simulate this with a placeholder URL
    const applicationData: ApplicationFormData = {
      ...formData,
      jobId: job.id,
      resumeUrl: `resume-${Date.now()}.pdf`, // Simulated URL
    };

    submitMutation.mutate(applicationData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);
    }
  };

  if (!job) return null;

  const formatSalary = (min?: string, max?: string, type?: string) => {
    if (!min && !max) return "Salary not specified";
    
    const format = (amount: string) => {
      const num = parseInt(amount);
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
      return `$${num.toLocaleString()}`;
    };

    const suffix = type === 'hourly' ? '/hr' : type === 'monthly' ? '/mo' : '/yr';
    
    if (min && max) {
      return `${format(min)} - ${format(max)}${suffix}`;
    }
    return `${format(min || max!)}+${suffix}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for Position</DialogTitle>
        </DialogHeader>

        {/* Job Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💼</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {job.title}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                {job.company?.name}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {job.isRemote ? "Remote" : job.location}
                </span>
                <span className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Upload */}
          <div>
            <Label className="text-sm font-medium">Resume *</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
                required
              />
              <label htmlFor="resume" className="cursor-pointer">
                {resumeFile ? (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="text-green-500 h-8 w-8 mb-2" />
                  </div>
                ) : (
                  <Upload className="text-gray-400 h-8 w-8 mb-2 mx-auto" />
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  {resumeFile ? resumeFile.name : "Click to upload your resume"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  PDF, DOC, or DOCX (max 5MB)
                </p>
              </label>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <Label htmlFor="coverLetter" className="text-sm font-medium">
              Cover Letter (Optional)
            </Label>
            <Textarea
              id="coverLetter"
              rows={4}
              className="mt-2"
              placeholder="Tell us why you're interested in this position..."
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
            />
          </div>

          {/* Application Process */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Application Process</h4>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-primary">
                <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                Submit Application
              </div>
              <div className="flex items-center text-gray-400 dark:text-gray-600">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                Under Review
              </div>
              <div className="flex items-center text-gray-400 dark:text-gray-600">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                Interview
              </div>
              <div className="flex items-center text-gray-400 dark:text-gray-600">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                Decision
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
