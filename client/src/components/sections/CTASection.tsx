import React from 'react';
import { Star } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Life?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of users who have already started their fitness journey with GymSyAI
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
            Start Free Trial
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
            Learn More
          </button>
        </div>

        <div className="mt-12 flex justify-center items-center space-x-2">
          <div className="flex -space-x-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-10 h-10 bg-white rounded-full border-2 border-white"></div>
            ))}
          </div>
          <div className="ml-4 text-white">
            <div className="flex items-center">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-sm text-blue-100">Trusted by 50,000+ users</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;