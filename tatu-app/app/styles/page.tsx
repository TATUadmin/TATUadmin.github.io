'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TattooStyle {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  examples: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  popularity: 'High' | 'Medium' | 'Low';
  image: string;
  color: string;
}

const tattooStyles: TattooStyle[] = [
  {
    id: 'traditional',
    name: 'Traditional (American)',
    description: 'Bold, colorful designs with thick outlines and limited color palette. Classic nautical and patriotic themes.',
    characteristics: ['Bold outlines', 'Limited color palette', 'Classic themes', 'High contrast'],
    examples: ['Eagles', 'Roses', 'Anchors', 'Skulls'],
    difficulty: 'Beginner',
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    color: 'text-red-500'
  },
  {
    id: 'realism',
    name: 'Realism',
    description: 'Photorealistic tattoos that look like actual photographs or paintings.',
    characteristics: ['Photorealistic', 'Detailed shading', 'Natural colors', 'Complex gradients'],
    examples: ['Portraits', 'Animals', 'Landscapes', 'Objects'],
    difficulty: 'Advanced',
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    color: 'text-blue-500'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft, flowing designs that mimic watercolor paintings with splashes and bleeds.',
    characteristics: ['Soft edges', 'Flowing colors', 'Bleeding effects', 'Pastel tones'],
    examples: ['Abstract art', 'Nature scenes', 'Flowers', 'Landscapes'],
    difficulty: 'Intermediate',
    popularity: 'Medium',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop',
    color: 'text-purple-500'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple, clean designs with minimal detail and often single-line work.',
    characteristics: ['Simple lines', 'Minimal detail', 'Clean aesthetic', 'Geometric shapes'],
    examples: ['Single lines', 'Geometric patterns', 'Simple symbols', 'Minimal text'],
    difficulty: 'Beginner',
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
    color: 'text-gray-500'
  },
  {
    id: 'japanese',
    name: 'Japanese (Irezumi)',
    description: 'Traditional Japanese art with bold colors, detailed backgrounds, and cultural symbolism.',
    characteristics: ['Bold colors', 'Detailed backgrounds', 'Cultural themes', 'Large scale'],
    examples: ['Dragons', 'Koi fish', 'Cherry blossoms', 'Samurai'],
    difficulty: 'Advanced',
    popularity: 'Medium',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    color: 'text-orange-500'
  },
  {
    id: 'blackwork',
    name: 'Blackwork',
    description: 'Bold, solid black designs often geometric or abstract in nature.',
    characteristics: ['Solid black', 'Geometric shapes', 'High contrast', 'Bold lines'],
    examples: ['Geometric patterns', 'Abstract designs', 'Tribal motifs', 'Solid shapes'],
    difficulty: 'Intermediate',
    popularity: 'Medium',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    color: 'text-black'
  },
  {
    id: 'neo-traditional',
    name: 'Neo-Traditional',
    description: 'Modern take on traditional style with more colors, depth, and contemporary themes.',
    characteristics: ['Modern themes', 'Enhanced depth', 'Expanded color palette', 'Contemporary subjects'],
    examples: ['Pop culture', 'Modern symbols', 'Enhanced traditional', 'Contemporary art'],
    difficulty: 'Intermediate',
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop',
    color: 'text-green-500'
  },
  {
    id: 'tribal',
    name: 'Tribal',
    description: 'Bold, black designs inspired by indigenous cultures and ancient tribal art.',
    characteristics: ['Bold black lines', 'Cultural inspiration', 'Geometric patterns', 'Symbolic meaning'],
    examples: ['Cultural symbols', 'Geometric patterns', 'Ancient motifs', 'Symbolic designs'],
    difficulty: 'Beginner',
    popularity: 'Low',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
    color: 'text-yellow-500'
  }
];

export default function TattooStylesPage() {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [popularityFilter, setPopularityFilter] = useState<string>('all');

  const filteredStyles = tattooStyles.filter(style => {
    if (difficultyFilter !== 'all' && style.difficulty !== difficultyFilter) return false;
    if (popularityFilter !== 'all' && style.popularity !== popularityFilter) return false;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-white';
      case 'Intermediate': return 'text-gray-300';
      case 'Advanced': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'High': return 'text-white';
      case 'Medium': return 'text-gray-300';
      case 'Low': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24 border-b" style={{borderColor: '#171717'}}>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-5xl md:text-6xl text-white mb-6">
              Tattoo Styles Guide
            </h1>
            <p className="body text-xl text-gray-300 max-w-2xl mx-auto">
              Discover different tattoo styles, understand their characteristics, and find the perfect style for your next tattoo.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-surface">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-4 justify-center">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-2 bg-surface-2 text-white rounded-lg border focus:ring-2 focus:ring-white"
                style={{borderColor: '#171717'}}
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <select
                value={popularityFilter}
                onChange={(e) => setPopularityFilter(e.target.value)}
                className="px-4 py-2 bg-surface-2 text-white rounded-lg border focus:ring-2 focus:ring-white"
                style={{borderColor: '#171717'}}
              >
                <option value="all">All Popularity</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredStyles.map((style) => (
              <div
                key={style.id}
                className={`bg-surface rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                  selectedStyle === style.id ? 'ring-2 ring-white' : ''
                }`}
                onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
              >
                {/* Style Image */}
                <div className="relative h-48">
                  <Image
                    src={style.image}
                    alt={style.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{style.name}</h3>
                  </div>
                </div>

                {/* Style Info */}
                <div className="p-6">
                  <p className="text-gray-300 mb-4 line-clamp-3">{style.description}</p>
                  
                  {/* Difficulty and Popularity */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-sm font-medium ${getDifficultyColor(style.difficulty)}`}>
                      {style.difficulty}
                    </span>
                    <span className={`text-sm font-medium ${getPopularityColor(style.popularity)}`}>
                      {style.popularity} Popularity
                    </span>
                  </div>

                  {/* Characteristics */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Characteristics:</h4>
                    <div className="flex flex-wrap gap-1">
                      {style.characteristics.slice(0, 3).map((char, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-surface-2 text-gray-300 text-xs rounded-full"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Examples:</h4>
                    <p className="text-sm text-gray-300">{style.examples.join(', ')}</p>
                  </div>

                  {/* Expandable Content */}
                  {selectedStyle === style.id && (
                    <div className="mt-4 pt-4 border-t" style={{borderColor: '#171717'}}>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">All Characteristics:</h4>
                        <div className="flex flex-wrap gap-1">
                          {style.characteristics.map((char, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-surface-2 text-gray-300 text-xs rounded-full"
                            >
                              {char}
                        </span>
                          ))}
                        </div>
                      </div>
                      
                      <Link
                        href={`/explore?style=${style.name.toLowerCase()}`}
                        className="inline-block bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Find {style.name} Artists
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display text-4xl md:text-5xl text-white mb-6">
              Ready to Find Your Artist?
            </h2>
            <p className="body text-xl text-gray-300 mb-8">
              Now that you understand the different styles, find the perfect artist to bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="btn btn-primary">
                Browse All Artists
              </Link>
              <Link href="/how-it-works" className="btn btn-ghost">
                Learn How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 