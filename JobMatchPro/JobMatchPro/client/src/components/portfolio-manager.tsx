import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Github, 
  Eye,
  Save,
  Upload,
  Folder,
  Code,
  Globe
} from 'lucide-react';
import type { PortfolioProject } from '@/types';

export default function PortfolioManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  const { data: portfolios, isLoading } = useQuery<PortfolioProject[]>({
    queryKey: ['/api/portfolios'],
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectUrl: '',
    githubUrl: '',
    technologies: [] as string[],
    imageUrl: '',
  });

  const [techInput, setTechInput] = useState('');

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest('POST', '/api/portfolios', projectData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project added",
        description: "Your portfolio project has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios'] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add project",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest('DELETE', `/api/portfolios/${projectId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "Your portfolio project has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      projectUrl: '',
      githubUrl: '',
      technologies: [],
      imageUrl: '',
    });
    setEditingProject(null);
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    createProjectMutation.mutate(formData);
  };

  const handleEditProject = (project: PortfolioProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      projectUrl: project.projectUrl || '',
      githubUrl: project.githubUrl || '',
      technologies: project.technologies || [],
      imageUrl: project.imageUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const popularTechnologies = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Laravel',
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'PHP', 'Go', 'Rust',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'Flutter', 'React Native', 'Swift', 'Kotlin', 'TailwindCSS', 'Bootstrap', 'Sass'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Folder className="h-5 w-5 mr-2" />
              Portfolio Projects
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-linkedin-blue hover:bg-linkedin-dark"
                  onClick={resetForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Title *
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="E-commerce Platform"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your project, its features, and your role..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Live Demo URL
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="url"
                            value={formData.projectUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, projectUrl: e.target.value }))}
                            placeholder="https://your-project.com"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          GitHub Repository
                        </label>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="url"
                            value={formData.githubUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                            placeholder="https://github.com/username/repo"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Image URL
                      </label>
                      <Input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://your-image-url.com/screenshot.png"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Add a screenshot or demo image of your project
                      </p>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Technologies Used
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        placeholder="Add technology (e.g. React, Node.js)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTechnology();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTechnology} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Popular Technologies */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular technologies:</p>
                      <div className="flex flex-wrap gap-1">
                        {popularTechnologies.slice(0, 12).map((tech) => (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => {
                              if (!formData.technologies.includes(tech)) {
                                setFormData(prev => ({
                                  ...prev,
                                  technologies: [...prev.technologies, tech]
                                }));
                              }
                            }}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Technologies */}
                    {formData.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleRemoveTechnology(tech)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProjectMutation.isPending}
                      className="bg-linkedin-blue hover:bg-linkedin-dark"
                    >
                      {createProjectMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingProject ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingProject ? 'Update Project' : 'Add Project'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : portfolios && portfolios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-0">
                    {/* Project Image */}
                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden relative">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgNzVIMjUwVjEyNUgxNTBWNzVaIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPlByb2plY3QgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Code className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Project Image</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          {project.projectUrl && (
                            <Button size="sm" variant="secondary" asChild>
                              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {project.githubUrl && (
                            <Button size="sm" variant="secondary" asChild>
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {project.title}
                        </h3>
                        <div className="flex space-x-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Links */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {project.projectUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Live
                              </a>
                            </Button>
                          )}
                          {project.githubUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-3 w-3 mr-1" />
                                Code
                              </a>
                            </Button>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No projects in your portfolio
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Showcase your work by adding projects to your portfolio. Include live demos, source code, and technologies used.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-linkedin-blue hover:bg-linkedin-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
