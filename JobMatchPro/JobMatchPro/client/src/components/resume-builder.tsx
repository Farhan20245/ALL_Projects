import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Upload, 
  Download, 
  Plus, 
  X, 
  Edit,
  Trash2,
  Eye,
  Save,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Lightbulb
} from 'lucide-react';
import type { ResumeData } from '@/types';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upload');
  const [isBuilding, setIsBuilding] = useState(false);

  const { data: resumes } = useQuery({
    queryKey: ['/api/resumes'],
    enabled: !!user,
  });

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      location: user?.location || '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
    },
  });

  const saveResumeMutation = useMutation({
    mutationFn: async (data: ResumeData) => {
      const response = await apiRequest('POST', '/api/resumes', {
        fileName: 'Built Resume',
        isBuiltWithBuilder: true,
        resumeData: data,
        isDefault: true,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resume saved",
        description: "Your resume has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      setIsBuilding(false);
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save resume",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);
    uploadResumeMutation.mutate(formData);
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience || [],
        { title: '', company: '', duration: '', description: '' }
      ]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience?.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ) || []
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience?.filter((_, i) => i !== index) || []
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education || [],
        { degree: '', institution: '', year: '' }
      ]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education?.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ) || []
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index) || []
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !resumeData.skills?.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications || [],
        { name: '', issuer: '', year: '' }
      ]
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications?.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      ) || []
    }));
  };

  const removeCertification = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const [skillInput, setSkillInput] = useState('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Resume Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Resume</TabsTrigger>
              <TabsTrigger value="builder">CV Builder</TabsTrigger>
              <TabsTrigger value="manage">My Resumes</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-linkedin-blue transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Upload Your Resume
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Upload your existing resume in PDF or DOC format
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload">
                  <Button 
                    as="span" 
                    className="bg-linkedin-blue hover:bg-linkedin-dark cursor-pointer"
                    disabled={uploadResumeMutation.isPending}
                  >
                    {uploadResumeMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supported formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
            </TabsContent>

            {/* Builder Tab */}
            <TabsContent value="builder" className="space-y-6">
              {!isBuilding ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Build Your Professional CV
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Create a professional CV using our step-by-step builder
                  </p>
                  <Button 
                    onClick={() => setIsBuilding(true)}
                    className="bg-linkedin-blue hover:bg-linkedin-dark"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start Building
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Full Name</label>
                          <Input
                            value={resumeData.personalInfo?.fullName || ''}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                            }))}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email</label>
                          <Input
                            type="email"
                            value={resumeData.personalInfo?.email || ''}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value }
                            }))}
                            placeholder="your.email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone</label>
                          <Input
                            value={resumeData.personalInfo?.phone || ''}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, phone: e.target.value }
                            }))}
                            placeholder="+880 1XXX XXXXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Location</label>
                          <Input
                            value={resumeData.personalInfo?.location || ''}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value }
                            }))}
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Professional Summary</label>
                        <Textarea
                          value={resumeData.personalInfo?.summary || ''}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, summary: e.target.value }
                          }))}
                          placeholder="Brief summary of your professional background and goals..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Experience */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Briefcase className="h-5 w-5 mr-2" />
                          Work Experience
                        </CardTitle>
                        <Button onClick={addExperience} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {resumeData.experience?.map((exp, index) => (
                        <Card key={index} className="border border-gray-200 dark:border-gray-600">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">Experience #{index + 1}</h4>
                              <Button
                                onClick={() => removeExperience(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Job Title</label>
                                <Input
                                  value={exp.title}
                                  onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                  placeholder="Software Engineer"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Company</label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                  placeholder="Company Name"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Duration</label>
                                <Input
                                  value={exp.duration}
                                  onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                                  placeholder="Jan 2020 - Present"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <Textarea
                                  value={exp.description}
                                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                  placeholder="Describe your responsibilities and achievements..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {(!resumeData.experience || resumeData.experience.length === 0) && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No work experience added yet. Click "Add Experience" to get started.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Education */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <GraduationCap className="h-5 w-5 mr-2" />
                          Education
                        </CardTitle>
                        <Button onClick={addEducation} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Education
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {resumeData.education?.map((edu, index) => (
                        <Card key={index} className="border border-gray-200 dark:border-gray-600">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">Education #{index + 1}</h4>
                              <Button
                                onClick={() => removeEducation(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Degree</label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                  placeholder="Bachelor of Science"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Institution</label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                  placeholder="University Name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Year</label>
                                <Input
                                  value={edu.year}
                                  onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                  placeholder="2020"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {(!resumeData.education || resumeData.education.length === 0) && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No education added yet. Click "Add Education" to get started.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Add a skill (e.g. React, Python, Project Management)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill(skillInput);
                              setSkillInput('');
                            }
                          }}
                        />
                        <Button 
                          onClick={() => {
                            addSkill(skillInput);
                            setSkillInput('');
                          }}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {resumeData.skills && resumeData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Certifications */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Certifications
                        </CardTitle>
                        <Button onClick={addCertification} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Certification
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {resumeData.certifications?.map((cert, index) => (
                        <Card key={index} className="border border-gray-200 dark:border-gray-600">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">Certification #{index + 1}</h4>
                              <Button
                                onClick={() => removeCertification(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Certification Name</label>
                                <Input
                                  value={cert.name}
                                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                  placeholder="AWS Solutions Architect"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Issuer</label>
                                <Input
                                  value={cert.issuer}
                                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                  placeholder="Amazon Web Services"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Year</label>
                                <Input
                                  value={cert.year}
                                  onChange={(e) => updateCertification(index, 'year', e.target.value)}
                                  placeholder="2023"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {(!resumeData.certifications || resumeData.certifications.length === 0) && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No certifications added yet. Click "Add Certification" to get started.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <Button
                      onClick={() => setIsBuilding(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        onClick={() => saveResumeMutation.mutate(resumeData)}
                        disabled={saveResumeMutation.isPending}
                        className="bg-linkedin-blue hover:bg-linkedin-dark"
                      >
                        {saveResumeMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Resume
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Manage Tab */}
            <TabsContent value="manage" className="space-y-6">
              {resumes && resumes.length > 0 ? (
                <div className="space-y-4">
                  {resumes.map((resume: any) => (
                    <Card key={resume.id} className="border border-gray-200 dark:border-gray-600">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-linkedin-blue rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {resume.fileName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {resume.isBuiltWithBuilder ? 'Built with CV Builder' : 'Uploaded File'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Created {new Date(resume.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {resume.isDefault && (
                              <Badge variant="default" className="bg-success-green text-white">
                                Default
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {resume.isBuiltWithBuilder && (
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No resumes found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Upload your resume or build one using our CV builder to get started.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => setActiveTab('upload')} variant="outline">
                      Upload Resume
                    </Button>
                    <Button 
                      onClick={() => {
                        setActiveTab('builder');
                        setIsBuilding(true);
                      }}
                      className="bg-linkedin-blue hover:bg-linkedin-dark"
                    >
                      Build CV
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
