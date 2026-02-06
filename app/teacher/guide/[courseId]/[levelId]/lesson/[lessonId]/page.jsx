"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ClockIcon,
  PlayCircleIcon,
  DocumentIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  PencilSquareIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

// Simple markdown renderer
const renderMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\n/g, '<br />') // Line breaks
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-2">$1</h1>') // H1
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mb-2">$1</h2>') // H2
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-medium mb-1">$1</h3>') // H3
    .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>') // List items
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'); // Inline code
};

// Mock lesson data with multiple PDFs and assignments
const mockLessonData = {
  1: {
    1: {
      1: {
        id: 1,
        title: "Alphabet and Pronunciation",
        duration: "45 min",
        level: "Beginner (A1)",
        type: "Alifbo",
        difficulty: "Oson",
        description: "Bu darsda talabalar ingliz tilidagi 26 ta harfni va ularning tovushlarini o'rganishadi.",
        
        // Multiple PDFs section
        pdfs: [
          {
            id: 1,
            title: "Asosiy darslik - Alphabet",
            description: "26 ta harf va tovushlar",
            size: "2.1 MB",
            pages: 15,
            isMainPdf: true
          },
          {
            id: 2,
            title: "Pronunciation Guide",
            description: "Tovush chiqarish qoidalari",
            size: "1.8 MB", 
            pages: 12,
            isMainPdf: false
          },
          {
            id: 3,
            title: "Practice Worksheets",
            description: "Amaliy mashq varaqalari",
            size: "0.9 MB",
            pages: 8,
            isMainPdf: false
          },
          {
            id: 4,
            title: "Audio Transcripts",
            description: "Audio mashqlar matni",
            size: "0.5 MB",
            pages: 4,
            isMainPdf: false
          }
        ],

        // Assignments section
        assignments: [
          {
            id: 1,
            title: "ABC harflari yozish",
            description: "Barcha harflarni 3 marta yozib chiqing",
            type: "Yozma ish",
            difficulty: "Oson",
            timeEstimate: "15 min",
            dueDate: "Keyingi dars",
            points: 10
          },
          {
            id: 2,
            title: "Tovushlar amaliyoti",
            description: "Audio faylni tinglab, harflarni takrorlang",
            type: "Audio mashq",
            difficulty: "O'rta",
            timeEstimate: "20 min",
            dueDate: "2 kun",
            points: 15
          },
          {
            id: 3,
            title: "Alfavit qo'shig'i",
            description: "ABC qo'shig'ini yod olib, video yozing",
            type: "Video topshiriq",
            difficulty: "Qiyin",
            timeEstimate: "30 min",
            dueDate: "1 hafta",
            points: 20
          }
        ],

        // Learning objectives
        objectives: [
          "26 ta ingliz harfini tanish va yodlash",
          "Har bir harfning to'g'ri tovushini chiqarish",
          "Kichik va katta harflar o'rtasidagi farqni bilish",
          "Oddiy so'zlarni harflab o'qish"
        ],

        // Key vocabulary
        vocabulary: [
          { word: "Hello", translation: "Salom", pronunciation: "/həˈloʊ/" },
          { word: "Goodbye", translation: "Xayr", pronunciation: "/ɡʊdˈbaɪ/" },
          { word: "Thank you", translation: "Rahmat", pronunciation: "/θæŋk juː/" },
          { word: "Please", translation: "Iltimos", pronunciation: "/pliːz/" }
        ],

        // Single information card
        infoCard: {
          id: 1,
          title: "Dars haqida",
          content: `# Ingliz tili alfaviti

Bu darsda talabalar **ingliz tilidagi 26 ta harfni** va ularning tovushlarini o'rganishadi.

## Asosiy maqsadlar:
- Harflarni tanish va yodlash
- To'g'ri talaffuz qilish
- Kichik va katta harflar farqini bilish

### Maslahatlar:
- Har bir harfni *bosh tovush* bilan ayting
- Ko'rgan so'zlarni harflab o'qishga harakat qiling
- Kuniga 5-10 daqiqa mashq qiling
- Xatoga qo'rqmang, takrorlash juda muhim

**Eslatma:** Darsni boshlashdan oldin \`Audio materiallar\` tayyorlab qo'ying.`,
          color: "blue"
        }
      }
    }
  }
};

const LessonDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { courseId, levelId, lessonId } = params;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [cardColor, setCardColor] = useState('blue');
  const [speechRate, setSpeechRate] = useState(1);
  
  // Convert string params to integers
  const courseIdInt = parseInt(courseId, 10);
  const levelIdInt = parseInt(levelId, 10);
  const lessonIdInt = parseInt(lessonId, 10);
  
  const lessonData = mockLessonData[courseIdInt]?.[levelIdInt]?.[lessonIdInt];
  
  // Color schemes for cards
  const getColorClasses = (color) => {
    const schemes = {
      blue: 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-25',
      green: 'border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-25',
      orange: 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-25',
      red: 'border-l-rose-500 bg-gradient-to-r from-rose-50 to-rose-25',
      purple: 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-purple-25',
      pink: 'border-l-pink-500 bg-gradient-to-r from-pink-50 to-pink-25'
    };
    return schemes[color] || schemes.blue;
  };
  
  const getBackgroundColor = (color) => {
    const backgrounds = {
      blue: 'bg-blue-50/40',
      green: 'bg-emerald-50/40',
      orange: 'bg-orange-50/40', 
      red: 'bg-rose-50/40',
      purple: 'bg-purple-50/40',
      pink: 'bg-pink-50/40'
    };
    return backgrounds[color] || backgrounds.blue;
  };
  
  // Speech function
  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      alert('Brauzeringiz ovozli o\'qishni qo\'llab-quvvatlamaydi');
    }
  };
  
  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Dars topilmadi</h2>
          <p className="text-gray-600 mb-6">Kechirasiz, siz qidirayotgan dars mavjud emas.</p>
          <button 
            onClick={() => router.back()}
            className="text-white bg-[#A60E07] hover:bg-[#8b0c06] px-6 py-3 rounded-lg font-bold transition-all"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Umumiy ma\'lumot', icon: BookOpenIcon },
    { id: 'pdfs', label: 'PDF materiallar', icon: DocumentIcon },
    { id: 'assignments', label: 'Topshiriqlar', icon: ClipboardDocumentCheckIcon },
    { id: 'vocabulary', label: 'Lug\'at', icon: AcademicCapIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="py-2">
          <div className="flex items-center gap-4 mb-2 px-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {lessonData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {lessonData.duration}
                </span>
                <span>•</span>
                <span>{lessonData.level}</span>
                <span>•</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {lessonData.type}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 overflow-x-auto px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#A60E07] border-[#A60E07]'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-3">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="py-3">
            {/* Single Information Card */}
            <div className={`rounded-lg shadow-md p-4 border-l-4 relative transition-all duration-300 ${getColorClasses(cardColor)} ${getBackgroundColor(cardColor)}`}>
              {/* Color dots */}
              <div className="absolute top-4 right-4 flex gap-2">
                {['blue', 'green', 'orange', 'red', 'purple', 'pink'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setCardColor(color)}
                    className={`w-5 h-5 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform cursor-pointer ${
                      color === 'blue' ? 'bg-blue-500' :
                      color === 'green' ? 'bg-emerald-500' :
                      color === 'orange' ? 'bg-orange-500' :
                      color === 'red' ? 'bg-rose-500' :
                      color === 'purple' ? 'bg-purple-500' :
                      'bg-pink-500'
                    } ${cardColor === color ? 'ring-2 ring-gray-600' : ''}`}
                  />
                ))}
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4 pr-28">{lessonData.infoCard.title}</h2>
              <div 
                className="text-gray-800 leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(lessonData.infoCard.content) }}
              />
            </div>
          </div>
        )}

        {/* PDFs Tab */}
        {activeTab === 'pdfs' && (
          <div className="px-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF materiallar</h2>
              <p className="text-gray-600">Darsga tegishli barcha PDF fayllar</p>
            </div>

            <div className="grid gap-4">
              {lessonData.pdfs.map((pdf) => (
                <div key={pdf.id} 
                     className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                       pdf.isMainPdf ? 'border-[#A60E07]' : 'border-gray-300'
                     }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${pdf.isMainPdf ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <DocumentIcon className={`h-8 w-8 ${pdf.isMainPdf ? 'text-red-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pdf.title}</h3>
                        {pdf.isMainPdf && (
                          <span className="bg-[#A60E07] text-white text-xs px-2 py-1 rounded-full font-medium">
                            Asosiy material
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                        <EyeIcon className="h-4 w-4" />
                        Ko'rish
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{pdf.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{pdf.size}</span>
                    <span>•</span>
                    <span>{pdf.pages} sahifa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="px-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Topshiriqlar</h2>
              <p className="text-gray-600">Dars uchun berilgan vazifalar</p>
            </div>

            <div className="grid gap-4">
              {lessonData.assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <PencilSquareIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                        <p className="text-gray-600 mb-3">{assignment.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                            {assignment.type}
                          </span>
                          <span className={`px-2 py-1 rounded font-medium ${
                            assignment.difficulty === 'Oson' ? 'bg-green-100 text-green-800' :
                            assignment.difficulty === 'O\'rta' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assignment.difficulty}
                          </span>
                          <span className="text-gray-600">
                            <ClockIcon className="h-4 w-4 inline mr-1" />
                            {assignment.timeEstimate}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-[#A60E07] text-white px-3 py-1 rounded-lg font-bold text-lg mb-1">
                        {assignment.points} ball
                      </div>
                      <p className="text-sm text-gray-600">Muddati: {assignment.dueDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="bg-[#A60E07] hover:bg-[#8b0c06] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Topshiriqni boshlash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vocabulary Tab */}
        {activeTab === 'vocabulary' && (
          <div className="px-4 relative">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Asosiy lug'at</h2>
              <p className="text-gray-600">Darsda ishlatiladigan muhim so'zlar</p>
            </div>

            {/* Speech Control - Right Corner */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Tezlik:</span>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 font-mono w-8">{speechRate.toFixed(1)}x</span>
              </div>
            </div>

            <div className="grid gap-3">
              {lessonData.vocabulary.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-indigo-500">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{item.word}</h3>
                        <span className="text-gray-400">→</span>
                        <p className="text-lg text-gray-700">{item.translation}</p>
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{item.pronunciation}</p>
                    </div>
                    
                    <button 
                      onClick={() => speakWord(item.word)}
                      className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ml-4"
                    >
                      <SpeakerWaveIcon className="h-4 w-4" />
                      Tinglash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetailPage;