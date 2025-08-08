import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Dumbbell, Heart, Users, Trophy, Clock, Target, ArrowRight, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: Icon, title, description, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative w-full max-w-sm mx-auto cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-200/50 via-blue-200/40 to-cyan-300/50 blur-xl transition-all duration-500 ${
        isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-95'
      }`} />
      
      {/* Main card */}
      <div className="relative bg-white/90 backdrop-blur-lg border border-cyan-200/60 rounded-2xl p-8 h-full transition-all duration-500 hover:bg-white hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-200/30 hover:-translate-y-2">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br from-cyan-50/60 via-transparent to-blue-100/40 rounded-2xl transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-50'
        }`} />
        
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div 
            className={`absolute w-20 h-20 bg-cyan-100/60 rounded-full blur-2xl transition-all duration-700 ${
              isHovered ? 'scale-150 opacity-80' : 'scale-100 opacity-40'
            }`} 
            style={{ top: '15%', right: '15%' }} 
          />
          <div 
            className={`absolute w-16 h-16 bg-blue-200/60 rounded-full blur-xl transition-all duration-700 delay-100 ${
              isHovered ? 'scale-125 opacity-90' : 'scale-75 opacity-50'
            }`} 
            style={{ bottom: '25%', left: '20%' }} 
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon container */}
          <div className={`mb-6 transition-all duration-400 ${
            isHovered ? 'scale-110 -translate-y-2' : 'scale-100'
          }`}>
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl blur-md transition-all duration-400 ${
                isHovered ? 'opacity-70 scale-110' : 'opacity-40 scale-100'
              }`} />
              <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl shadow-lg">
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className={`text-2xl font-bold text-gray-800 mb-4 transition-all duration-400 ${
            isHovered ? 'text-gray-900 scale-105' : 'text-gray-800'
          }`}>
            {title}
          </h3>
          
          {/* Description */}
          <p className={`text-gray-600 leading-relaxed mb-6 transition-all duration-400 ${
            isHovered ? 'text-gray-700' : 'text-gray-600'
          }`}>
            {description}
          </p>
          
          {/* Learn More button */}
          <div className={`flex items-center text-cyan-600 font-medium group-hover:text-cyan-700 transition-all duration-400 ${
            isHovered ? 'translate-x-2' : 'translate-x-0'
          }`}>
            <span className="mr-2">Learn More</span>
            <ChevronRight className={`w-4 h-4 transition-all duration-400 ${
              isHovered ? 'translate-x-1 scale-110' : 'translate-x-0'
            }`} />
          </div>
        </div>
        
        {/* Hover line effect */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-700 transition-all duration-500 rounded-b-2xl ${
          isHovered ? 'w-full opacity-100' : 'w-0 opacity-0'
        }`} />
      </div>
    </div>
  );
};

// Clean Gym Hero Section
const GymHeroSection: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    { icon: Dumbbell, text: "Advanced Equipment", color: "from-blue-500 to-blue-600" },
    { icon: Heart, text: "Health Monitoring", color: "from-blue-400 to-blue-500" },
    { icon: Target, text: "Goal Achievement", color: "from-blue-600 to-blue-700" },
    { icon: Users, text: "Expert Trainers", color: "from-blue-500 to-blue-600" },
  ];

  const gymServices = [
    {
      icon: Target,
      title: "AI Workout Plans",
      description: "Get personalized workout routines powered by AI that adapt to your fitness level and goals for optimal results."
    },
    {
      icon: Trophy,
      title: "Pre-Made Workouts",
      description: "Access our library of expertly crafted workout routines designed for all fitness levels and specific goals."
    },
    {
      icon: Heart,
      title: "Daily Motivation",
      description: "Stay inspired with daily motivational content, success stories, and progress tracking to keep you moving forward."
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);



  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Clean white to blue gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            rgba(145, 255, 255, 1) 0%, 
            rgba(248, 250, 252, 1) 30%, 
            rgba(241, 245, 249, 1) 60%, 
            rgba(179, 234, 254, 0.8) 100%
          )`
        }}
      />

      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute w-96 h-96 bg-blue-100 rounded-full blur-3xl -top-48 -right-48" />
        <div className="absolute w-96 h-96 bg-blue-50 rounded-full blur-3xl -bottom-48 -left-48" />
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pt-20">
        {/* Main heading */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="inline-block text-gray-800 mb-3">
              Transform Your
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Fitness Journey
            </span>
          </h1>

          {/* Feature showcase */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                {React.createElement(features[currentFeature].icon, {
                  className: `text-2xl text-blue-600`
                })}
              </div>
              <span className="text-lg font-semibold text-gray-700">
                {features[currentFeature].text}
              </span>
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join our premium fitness center and discover a world of possibilities. From cutting-edge equipment to expert trainers, 
              we're here to help you achieve your fitness goals.
            </p>
          </div>
        </div>

        {/* CTA button */}
        <div className="flex justify-center items-center mb-16">
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-3 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg group"
          >
            <Zap className="text-yellow-400" />
            <span>Start Your Journey</span>
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          {[
            { number: "10K+", label: "Active Members", icon: Users },
            { number: "150+", label: "Workout Programs", icon: Dumbbell },
            { number: "24/7", label: "Gym Access", icon: Clock }
          ].map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div 
                key={index} 
                className="group relative text-center p-8 bg-white/90 backdrop-blur-lg rounded-2xl border border-cyan-200/60 shadow-lg hover:shadow-2xl hover:shadow-cyan-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-cyan-300/40 blur-xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-transparent to-blue-100/30 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute w-16 h-16 bg-cyan-100/50 rounded-full blur-2xl top-2 right-2 opacity-40 group-hover:opacity-80 group-hover:scale-150 transition-all duration-700" />
                  <div className="absolute w-12 h-12 bg-blue-200/50 rounded-full blur-xl bottom-3 left-3 opacity-50 group-hover:opacity-90 group-hover:scale-125 transition-all duration-700 delay-100" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with enhanced effects */}
                  <div className="text-4xl mb-4 mx-auto w-fit relative group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-400">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl blur-md opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-400" />
                    <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
                      <StatIcon className="text-white" />
                    </div>
                  </div>
                  
                  {/* Number with enhanced styling */}
                  <div className="text-4xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 group-hover:scale-105 transition-all duration-400">
                    {stat.number}
                  </div>
                  
                  {/* Label with hover effect */}
                  <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-400">
                    {stat.label}
                  </div>
                </div>
                
                {/* Hover line effect */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-700 w-0 group-hover:w-full opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-b-2xl" />
              </div>
            );
          })}
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {gymServices.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA with functional navigation */}
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Join thousands of members who have already transformed their lives with us.
          </p>
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:shadow-lg"
          >
            Join Now - Limited Time Offer
          </Link>
        </div>
      </div>

      {/* Floating Gym Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Random positioned gym icons */}
        <div className="absolute top-16 left-8 animate-bounce" style={{ animationDelay: '0s', animationDuration: '4s' }}>
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-full p-3 shadow-lg">
            <Dumbbell className="w-5 h-5 text-cyan-600" />
          </div>
        </div>
        
        <div className="absolute top-48 right-12 animate-pulse" style={{ animationDelay: '1.2s' }}>
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-full p-3 shadow-lg">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
        </div>
        
        <div className="absolute top-1/3 left-16 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3.5s' }}>
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-full p-3 shadow-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        
        <div className="absolute top-2/3 right-6 animate-pulse" style={{ animationDelay: '0.8s' }}>
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-full p-3 shadow-lg">
            <Target className="w-5 h-5 text-green-500" />
          </div>
        </div>
        
        <div className="absolute bottom-48 left-4 animate-bounce" style={{ animationDelay: '3s', animationDuration: '4.5s' }}>
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-full p-3 shadow-lg">
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
        </div>
        
        <div className="absolute bottom-24 right-24 animate-pulse" style={{ animationDelay: '1.8s' }}>
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-full p-3 shadow-lg">
            <Zap className="w-5 h-5 text-orange-500" />
          </div>
        </div>

        <div className="absolute top-24 right-1/4 animate-bounce" style={{ animationDelay: '4s', animationDuration: '3s' }}>
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-full p-3 shadow-lg">
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="absolute bottom-1/3 left-1/4 animate-pulse" style={{ animationDelay: '2.2s' }}>
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-full p-3 shadow-lg">
            <Clock className="w-5 h-5 text-teal-500" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GymHeroSection;