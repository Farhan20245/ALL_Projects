import { db } from "../server/db";
import { companies, jobs, users } from "../shared/schema";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(jobs);
    await db.delete(companies);
    await db.delete(users);

    // Insert sample users
    console.log("👥 Creating sample users...");
    const sampleUsers = await db.insert(users).values([
      {
        id: "1",
        email: "jobseeker@example.com",
        firstName: "John",
        lastName: "Doe",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "2", 
        email: "employer@example.com",
        firstName: "Jane",
        lastName: "Smith",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: "3",
        email: "admin@example.com", 
        firstName: "Admin",
        lastName: "User",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      }
    ]).returning();

    // Insert sample companies
    console.log("🏢 Creating sample companies...");
    const sampleCompanies = await db.insert(companies).values([
      {
        name: "TechCorp Solutions",
        description: "Leading technology company specializing in cloud computing, artificial intelligence, and enterprise software solutions. We're passionate about innovation and building products that transform how businesses operate in the digital age.",
        industry: "Technology",
        website: "https://techcorp.example.com",
        location: "San Francisco, CA",
        size: "500-1000",
        foundedYear: 2015,
        culture: "Innovation-driven, collaborative, remote-friendly work environment with emphasis on continuous learning and professional growth.",
        benefits: ["Health Insurance", "401k Matching", "Flexible PTO", "Remote Work", "Professional Development", "Stock Options"]
      },
      {
        name: "DataFlow Analytics", 
        description: "Data science and analytics company helping businesses make data-driven decisions. We specialize in machine learning, business intelligence, and predictive analytics across various industries.",
        industry: "Data & Analytics",
        website: "https://dataflow.example.com",
        location: "New York, NY",
        size: "100-500",
        foundedYear: 2018,
        culture: "Data-driven culture with focus on research, experimentation, and evidence-based decision making.",
        benefits: ["Health Insurance", "Dental Coverage", "Flexible Hours", "Learning Budget", "Conference Attendance", "Wellness Program"]
      },
      {
        name: "Green Energy Systems",
        description: "Renewable energy company focused on solar and wind power solutions. We're committed to sustainable technology and helping organizations transition to clean energy.",
        industry: "Renewable Energy", 
        website: "https://greenenergy.example.com",
        location: "Austin, TX",
        size: "200-500",
        foundedYear: 2012,
        culture: "Mission-driven organization focused on environmental impact and sustainable practices.",
        benefits: ["Health Insurance", "Retirement Plan", "Environmental Impact Bonus", "Bike to Work Program", "Solar Panel Discount"]
      }
    ]).returning();

    // Insert sample jobs
    console.log("💼 Creating sample job listings...");
    await db.insert(jobs).values([
      {
        title: "Senior Full Stack Developer",
        description: "We're looking for an experienced Full Stack Developer to join our engineering team. You'll work on cutting-edge projects using modern technologies and help shape the future of our platform.",
        requirements: ["5+ years experience with React and Node.js", "Experience with TypeScript", "Database design experience", "AWS/Cloud platform experience", "Strong problem-solving skills"],
        responsibilities: ["Develop and maintain web applications", "Collaborate with cross-functional teams", "Code review and mentoring", "System architecture decisions", "Performance optimization"],
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "Git"],
        salaryMin: 120000,
        salaryMax: 160000,
        salaryType: "yearly",
        jobType: "full-time",
        experienceLevel: "senior",
        location: "San Francisco, CA",
        isRemote: true,
        companyId: sampleCompanies[0].id,
        postedById: sampleUsers[1].id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        applicantCount: 15,
        viewCount: 125
      },
      {
        title: "Data Scientist",
        description: "Join our data science team to build predictive models and extract insights from large datasets. You'll work with cutting-edge ML technologies and collaborate with business stakeholders.",
        requirements: ["PhD or Masters in Data Science/Statistics", "3+ years Python experience", "Machine Learning expertise", "SQL proficiency", "Experience with cloud platforms"],
        responsibilities: ["Build predictive models", "Analyze large datasets", "Collaborate with business teams", "Present findings to stakeholders", "Develop data pipelines"],
        skills: ["Python", "R", "SQL", "TensorFlow", "Pandas", "Scikit-learn", "AWS", "Tableau"],
        salaryMin: 100000,
        salaryMax: 140000,
        salaryType: "yearly",
        jobType: "full-time", 
        experienceLevel: "mid",
        location: "New York, NY",
        isRemote: false,
        companyId: sampleCompanies[1].id,
        postedById: sampleUsers[1].id,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicantCount: 8,
        viewCount: 89
      },
      {
        title: "Frontend Developer",
        description: "We're seeking a talented Frontend Developer to create amazing user experiences. You'll work with our design team to build responsive, accessible web applications.",
        requirements: ["3+ years React experience", "Strong CSS/HTML skills", "JavaScript ES6+", "Responsive design", "Version control with Git"],
        responsibilities: ["Develop user interfaces", "Implement responsive designs", "Optimize performance", "Collaborate with designers", "Write clean, maintainable code"],
        skills: ["React", "JavaScript", "CSS3", "HTML5", "Sass", "Webpack", "Jest", "Figma"],
        salaryMin: 80000,
        salaryMax: 110000,
        salaryType: "yearly",
        jobType: "full-time",
        experienceLevel: "mid",
        location: "Austin, TX",
        isRemote: true,
        companyId: sampleCompanies[2].id,
        postedById: sampleUsers[1].id,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicantCount: 12,
        viewCount: 156
      },
      {
        title: "Product Manager",
        description: "Lead product strategy and development for our flagship platform. You'll work with engineering, design, and business teams to deliver exceptional user experiences.",
        requirements: ["5+ years product management experience", "Technical background preferred", "Strong analytical skills", "Experience with Agile/Scrum", "Excellent communication"],
        responsibilities: ["Define product roadmap", "Gather requirements", "Coordinate with development teams", "Analyze user feedback", "Market research"],
        skills: ["Product Strategy", "Agile", "Jira", "Analytics", "User Research", "Roadmapping", "SQL"],
        salaryMin: 130000,
        salaryMax: 170000,
        salaryType: "yearly",
        jobType: "full-time",
        experienceLevel: "senior", 
        location: "San Francisco, CA",
        isRemote: false,
        companyId: sampleCompanies[0].id,
        postedById: sampleUsers[1].id,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicantCount: 6,
        viewCount: 78
      },
      {
        title: "DevOps Engineer",
        description: "Help us scale our infrastructure and improve our deployment processes. You'll work with containerization, CI/CD, and cloud technologies.",
        requirements: ["4+ years DevOps experience", "Docker/Kubernetes", "AWS/GCP experience", "CI/CD pipelines", "Infrastructure as Code"],
        responsibilities: ["Manage cloud infrastructure", "Implement CI/CD pipelines", "Monitor system performance", "Automate deployments", "Ensure security compliance"],
        skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins", "Python", "Bash", "Monitoring"],
        salaryMin: 110000,
        salaryMax: 150000,
        salaryType: "yearly",
        jobType: "full-time",
        experienceLevel: "senior",
        location: "New York, NY", 
        isRemote: true,
        companyId: sampleCompanies[1].id,
        postedById: sampleUsers[1].id,
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicantCount: 9,
        viewCount: 134
      },
      {
        title: "UX Designer",
        description: "Create intuitive and beautiful user experiences for our energy management platform. You'll conduct user research and design interfaces that make complex data accessible.",
        requirements: ["3+ years UX design experience", "Proficiency in design tools", "User research experience", "Prototyping skills", "Understanding of accessibility"],
        responsibilities: ["Conduct user research", "Create wireframes and prototypes", "Design user interfaces", "Collaborate with development team", "Usability testing"],
        skills: ["Figma", "Sketch", "Adobe Creative Suite", "Prototyping", "User Research", "Accessibility", "Design Systems"],
        salaryMin: 85000,
        salaryMax: 115000,
        salaryType: "yearly",
        jobType: "full-time",
        experienceLevel: "mid",
        location: "Austin, TX",
        isRemote: false,
        companyId: sampleCompanies[2].id,
        postedById: sampleUsers[1].id,
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicantCount: 11,
        viewCount: 98
      }
    ]);

    console.log("✅ Database seeding completed successfully!");
    console.log("📊 Created:");
    console.log(`   - ${sampleUsers.length} users`);
    console.log(`   - ${sampleCompanies.length} companies`);
    console.log(`   - 6 job listings`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeding function
seed()
  .catch(console.error)
  .finally(() => process.exit(0));