/**
 * Practice Library Page
 * 
 * Displays a grid of available TOEFL speaking practice questions.
 * Users can search, filter by difficulty, and select topics to practice.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronRight, Sparkles } from 'lucide-react';
import { fetchQuestions, type Question } from '../../services/api';

// Extended question type with UI metadata
interface QuestionWithMeta extends Question {
  displayTitle: string;
  description: string;
  displayDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  plays: number;
  displayTags: string[];
}

// Map to derive metadata from question content (using backend data when available)
const getQuestionMeta = (question: Question): QuestionWithMeta => {
  // Use backend title if available, otherwise fallback to instruction-based title
  let displayTitle = question.title || 'Speaking Topic';
  if (!question.title) {
    // Fallback: extract from instruction
    const words = question.instruction.split(' ').slice(0, 3);
    displayTitle = words.join(' ') + '...';
  }
  
  // Use backend difficulty if available, otherwise default to MEDIUM
  const displayDifficulty = question.difficulty || 'MEDIUM';
  
  // Use backend tags if available, otherwise use sos_keywords
  const displayTags = question.tags || question.sos_keywords?.slice(0, 2) || ['Speaking', 'TOEFL'];
  
  // Mock play count (can be replaced with real analytics later)
  const plays = Math.floor((question.question_id.charCodeAt(question.question_id.length - 1) * 17) % 1500) + 500;
  
  return {
    ...question,
    displayTitle,
    description: question.instruction,
    displayDifficulty,
    plays,
    displayTags,
  };
};

// Difficulty badge colors
const difficultyStyles = {
  EASY: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  MEDIUM: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
  },
  HARD: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
  },
};

// Question Card Component
interface QuestionCardProps {
  question: QuestionWithMeta;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const difficultyStyle = difficultyStyles[question.displayDifficulty];
  
  return (
    <div 
      className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-400 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Header: Difficulty & Plays */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border} border`}>
          {question.displayDifficulty}
        </span>
        <span className="text-sm text-gray-400">
          {question.plays.toLocaleString()} plays
        </span>
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
        {question.displayTitle}
      </h3>
      
      {/* Description */}
      <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
        {question.description}
      </p>
      
      {/* Footer: Tags & Arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {question.displayTags.map((tag, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
        <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

// Coming Soon Card Component
const ComingSoonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center min-h-[240px] transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50 group cursor-pointer">
    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors duration-300">
      <Sparkles size={24} className="text-gray-300 group-hover:text-blue-500 transition-colors duration-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-400 mb-2 group-hover:text-blue-600 transition-colors duration-300">Coming Soon</h3>
    <p className="text-gray-300 text-sm text-center group-hover:text-gray-400 transition-colors duration-300">
      More practice questions<br />added weekly.
    </p>
  </div>
);

// Main Page Component
export const PracticeLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetchQuestions();
        const questionsWithMeta = response.questions.map(getQuestionMeta);
        setQuestions(questionsWithMeta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, []);
  
  // Filter questions based on search and difficulty
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        q.instruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.displayTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Difficulty filter
      const matchesDifficulty = !selectedDifficulty || q.displayDifficulty === selectedDifficulty;
      
      return matchesSearch && matchesDifficulty;
    });
  }, [questions, searchQuery, selectedDifficulty]);
  
  const handleQuestionClick = (questionId: string) => {
    navigate(`/questions/${questionId}`);
  };
  
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Library</h1>
        <p className="text-gray-500">Select a topic to start your speaking practice.</p>
      </div>
      
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4 mb-8">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        
        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all ${
            showFilters || selectedDifficulty 
              ? 'bg-blue-50 border-blue-200 text-blue-600' 
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Difficulty:</span>
            {(['EASY', 'MEDIUM', 'HARD'] as const).map((level) => {
              const style = difficultyStyles[level];
              const isSelected = selectedDifficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(isSelected ? null : level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? `${style.bg} ${style.text} ring-2 ring-offset-1 ${level === 'EASY' ? 'ring-emerald-300' : level === 'MEDIUM' ? 'ring-amber-300' : 'ring-rose-300'}`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {level}
                </button>
              );
            })}
            {selectedDifficulty && (
              <button
                onClick={() => setSelectedDifficulty(null)}
                className="text-sm text-gray-400 hover:text-gray-600 ml-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-32 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-full bg-gray-100 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-100 rounded mb-6" />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Questions Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.question_id}
              question={question}
              onClick={() => handleQuestionClick(question.question_id)}
            />
          ))}
          
          {/* Coming Soon Card - always show at the end */}
          <ComingSoonCard />
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No questions match your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty(null);
            }}
            className="text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default PracticeLibraryPage;

