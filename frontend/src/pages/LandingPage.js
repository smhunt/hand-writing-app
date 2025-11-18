import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const features = [
    {
      icon: '✍️',
      title: 'Your Personal Font',
      description: 'Transform your unique handwriting into a digital font that preserves your personal touch.',
    },
    {
      icon: '📸',
      title: 'Easy Capture',
      description: 'Simply write on our template, scan it, or draw characters directly in your browser.',
    },
    {
      icon: '📄',
      title: 'Instant PDFs',
      description: 'Generate beautiful handwritten notes in seconds. Perfect for cards, letters, and more.',
    },
    {
      icon: '🎨',
      title: 'Fully Customizable',
      description: 'Update your character set anytime. Add new letters, numbers, and symbols as needed.',
    },
    {
      icon: '🔒',
      title: 'Private & Secure',
      description: 'Your handwriting stays yours. All data is stored securely and never shared.',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Create professional handwritten documents instantly, saving hours of manual writing.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Account',
      description: 'Sign up in seconds with just a username and password',
    },
    {
      step: 2,
      title: 'Capture Your Writing',
      description: 'Download our template, fill it in, and upload a scan - or draw characters online',
    },
    {
      step: 3,
      title: 'Generate Notes',
      description: 'Type your message and watch it transform into your handwriting as a PDF',
    },
  ];

  const useCases = [
    { title: 'Personal Letters', emoji: '💌' },
    { title: 'Thank You Cards', emoji: '🙏' },
    { title: 'Invitations', emoji: '🎉' },
    { title: 'Greeting Cards', emoji: '🎂' },
    { title: 'Certificates', emoji: '🏆' },
    { title: 'Notes & Memos', emoji: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="page-container">
          <div className="py-16 md:py-24 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
              Your Handwriting,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                Digitally Yours
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
              Transform your unique handwriting into beautiful digital notes.
              Personal touch meets modern convenience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-4"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary text-lg px-8 py-4"
              >
                Sign In
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Free forever
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-pulse">✍️</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-10 animate-pulse delay-1000">📝</div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Handwritten Notes?
            </h2>
            <p className="text-xl text-gray-600">
              The perfect blend of personal and practical
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl opacity-90">
              Three simple steps to digital handwriting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-primary-100 text-lg">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="btn bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-4 inline-block"
            >
              Start Creating Now
            </Link>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-gray-50 py-20">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perfect For...
            </h2>
            <p className="text-xl text-gray-600">
              Endless possibilities for personalization
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-card hover:shadow-soft transition-shadow"
              >
                <div className="text-4xl mb-3">{useCase.emoji}</div>
                <p className="text-sm font-medium text-gray-700">{useCase.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-accent-600 to-accent-800 text-white py-20">
        <div className="page-container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of people who've rediscovered the joy of handwritten notes
            without the hassle of actually writing them by hand.
          </p>
          <Link
            to="/register"
            className="btn bg-white text-accent-700 hover:bg-gray-100 text-lg px-10 py-5 inline-block font-semibold"
          >
            Create Your Free Account
          </Link>
          <p className="text-sm mt-6 opacity-75">
            Takes less than 30 seconds • No credit card required
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4 font-handwriting">
                ✍️ Handwritten Notes
              </h3>
              <p className="text-sm">
                Your personal handwriting, digitally preserved and beautifully presented.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Handwritten Notes. All rights reserved.</p>
            <p className="mt-2 text-gray-500">
              Made with ❤️ and powered by Claude Code
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
