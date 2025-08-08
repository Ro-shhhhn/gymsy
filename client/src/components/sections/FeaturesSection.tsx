import React from 'react';
import { Brain, TrendingUp, Apple, MessageCircle } from 'lucide-react';
import type { FeatureProps } from '../../types';

const FeatureCard: React.FC<FeatureProps> = ({ icon: Icon, title, description }) => (
  <div className="text-center group">
    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
      <Icon className="h-10 w-10 text-blue-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FeaturesSection = () => {
  const features: FeatureProps[] = [
    {
      icon: Brain,
      title: "Smart Workout Plans",
      description: "AI creates personalized workout routines based on your goals, fitness level, and available equipment."
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your journey with detailed analytics, progress photos, and performance metrics."
    },
    {
      icon: Apple,
      title: "Nutrition Advice",
      description: "Get meal recommendations and nutritional guidance tailored to your dietary preferences."
    },
    {
      icon: MessageCircle,
      title: "24/7 AI Coach",
      description: "Your personal AI trainer is always available to answer questions and provide motivation."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose GymSyAI?
          </h2>
          <p className="text-xl text-gray-600">
            Advanced AI technology meets personalized fitness coaching
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;