import React from 'react';
import { Dumbbell, Heart, Target, Users, Apple, TrendingUp } from 'lucide-react';
import ServiceCard from '../ui/ServiceCard';
import type { ServiceCardProps } from '../../types';

const ServicesSection = () => {
  const services: Omit<ServiceCardProps, 'index'>[] = [
    {
      icon: Dumbbell,
      title: "Strength Training",
      description: "Build muscle and increase power with AI-guided strength training programs tailored to your fitness level and goals."
    },
    {
      icon: Heart,
      title: "Cardio Workouts",
      description: "Improve cardiovascular health with dynamic cardio routines that adapt to your progress and preferences."
    },
    {
      icon: Target,
      title: "Flexibility & Mobility",
      description: "Enhance your range of motion and prevent injuries with specialized flexibility and mobility exercises."
    },
    {
      icon: Users,
      title: "Group Training",
      description: "Join virtual group sessions and connect with fitness enthusiasts while staying motivated together."
    },
    {
      icon: Apple,
      title: "Nutrition Planning",
      description: "Get personalized meal plans and nutrition advice powered by AI to fuel your fitness journey."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your achievements with detailed analytics and insights to optimize your training."
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Fitness Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to achieve your fitness goals, powered by artificial intelligence
            and designed for real results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;