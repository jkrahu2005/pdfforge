// pages/About.jsx
const About = () => {
  const team = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      description: "Passionate about making PDF tools accessible to everyone",
      avatar: "👨‍💼"
    },
    {
      name: "Jane Smith",
      role: "Lead Developer",
      description: "Building robust and secure PDF processing solutions",
      avatar: "👩‍💻"
    },
    {
      name: "Mike Johnson",
      role: "UI/UX Designer",
      description: "Creating intuitive and beautiful user experiences",
      avatar: "🎨"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Happy Users" },
    { number: "1M+", label: "Files Processed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Free Support" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            About <span className="text-blue-600">PDFMaster</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            We're on a mission to make PDF document processing simple, secure, and accessible to everyone.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg">
                  PDFMaster was born from a simple idea: everyone should have access to powerful 
                  PDF tools without the complexity and high costs of traditional software.
                </p>
                <p className="text-lg">
                  Founded in 2024, we've helped thousands of users transform their document 
                  workflows with our easy-to-use, web-based PDF solutions.
                </p>
                <p className="text-lg">
                  Our commitment is to provide reliable, secure, and completely free tools 
                  that empower individuals and businesses to work smarter.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-8xl">🚀</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
            By The Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To democratize PDF document processing by providing free, secure, and 
                easy-to-use tools that work for everyone, everywhere.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become the most trusted and comprehensive PDF solution platform, 
                continuously innovating to meet evolving document needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="card-body text-center">
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="card-title text-gray-800 justify-center">{member.name}</h3>
                  <div className="text-blue-600 font-semibold mb-2">{member.role}</div>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4 text-blue-600">🔒</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Security First</h3>
              <p className="text-gray-600">
                Your files and privacy are our top priority. We automatically delete all processed files.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4 text-green-600">💯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Always Free</h3>
              <p className="text-gray-600">
                We believe essential tools should be accessible to everyone without cost barriers.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4 text-purple-600">⚡</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                We optimize every tool for speed, so you can get back to what matters most.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4 text-blue-600">🤝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">User-Focused</h3>
              <p className="text-gray-600">
                Every feature is designed with our users' needs and feedback in mind.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4 text-orange-600">🚀</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously improve and expand our tools to serve you better.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4 text-green-600">🌍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Accessibility</h3>
              <p className="text-gray-600">
                Our tools work on any device, anywhere, with no installation required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our growing community of users who trust PDFMaster for their document needs.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="btn bg-white text-blue-600 hover:bg-gray-100 border-white btn-lg">
              Start Using Tools
            </button>
            <button className="btn btn-outline border-white text-white hover:bg-blue-700 btn-lg">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;