"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ClockIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

// Mock lesson data
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
        topics: ["26 English letters", "Basic sounds", "Simple pronunciation", "Letter names vs sounds"],
        goals: [
          "ABC harflarini tanish va eslab qolish",
          "Harflar tovushini to'g'ri aytish",
          "Oddiy so'zlarni talaffuz qilish",
          "Harf nomlari va tovushlari farqini tushunish"
        ],
        materialsNeeded: [
          "Alphabet poster yoki flashcards",
          "Audio player for pronunciation", 
          "Whiteboard va marker",
          "Letter worksheets",
          "Simple picture cards"
        ],
        lessonSteps: {
          warmup: {
            title: "Warm-up (5 min)",
            activities: [
              "Teacher introduces himself/herself in English",
              "Simple 'Hello' circle - everyone says hello",
              "Body language greetings (handshake, wave, bow)"
            ]
          },
          presentation: {
            title: "Presentation (15 min)",
            activities: [
              "Introduce greeting phrases: Hello, Hi, Good morning, Good afternoon",
              "Model self-introduction: 'My name is...', 'I am...'",
              "Teach numbers 1-10 with gestures",
              "Show greeting cards with different times of day"
            ]
          },
          practice: {
            title: "Practice (25 min)",
            activities: [
              "Students practice greetings in pairs",
              "Name tag activity - students introduce themselves",
              "Number counting game in a circle",
              "Role-play: meeting someone new",
              "Listening activity: identify greetings"
            ]
          },
          production: {
            title: "Production (10 min)",
            activities: [
              "Students introduce themselves to the class",
              "Mini conversations in groups",
              "Number bingo game",
              "Create a class greeting poster"
            ]
          },
          homework: {
            title: "Homework (5 min)",
            activities: [
              "Practice greetings with family members",
              "Learn how to introduce one family member", 
              "Write numbers 1-10 in English",
              "Prepare to tell your age next lesson"
            ]
          }
        },
        teachingTips: [
          "Use gestures and body language to help students understand",
          "Encourage students even if they make mistakes",
          "Repeat new words several times with different intonations",
          "Use visual aids to support understanding",
          "Create a friendly and relaxed atmosphere"
        ],
        commonMistakes: [
          "Students might use their native language pronunciation for 'Hello'",
          "Confusion between 'My name is...' and 'I am...'",
          "Difficulty with numbers 6, 7, 8 pronunciation",
          "Students might be shy to speak in front of others"
        ],
        extraActivities: [
          "Greeting song or chant",
          "Cultural differences in greetings discussion",
          "Make name badges with numbers",
          "Greeting relay race",
          "Interview a classmate activity"
        ],
        resources: [
          {
            type: "pdf",
            name: "Greetings Worksheet",
            size: "1.2 MB",
            description: "Practice worksheet with greeting phrases"
          },
          {
            type: "audio",
            name: "Pronunciation Audio",
            duration: "5:30",
            description: "Native speaker pronunciation examples"
          },
          {
            type: "video",
            name: "Greeting Situations",
            duration: "8:15",
            description: "Video showing different greeting scenarios"
          },
          {
            type: "doc",
            name: "Teacher Notes",
            size: "0.8 MB",
            description: "Additional teaching tips and variations"
          }
        ]
      }
    }
  }
};

const StepSection = ({ step, title, isOpen, onToggle, children }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
    >
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {isOpen ? (
        <ChevronDownIcon className="h-5 w-5 text-gray-600" />
      ) : (
        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
      )}
    </button>
    
    {isOpen && (
      <div className="px-6 py-4 border-t border-gray-200">
        {children}
      </div>
    )}
  </div>
);

const ResourceIcon = ({ type }) => {
  const icons = {
    pdf: DocumentTextIcon,
    video: VideoCameraIcon,
    audio: SpeakerWaveIcon,
    doc: DocumentTextIcon
  };
  
  const colors = {
    pdf: "text-red-600",
    video: "text-blue-600", 
    audio: "text-green-600",
    doc: "text-purple-600"
  };
  
  const Icon = icons[type] || DocumentTextIcon;
  const colorClass = colors[type] || "text-gray-600";
  
  return <Icon className={`h-5 w-5 ${colorClass}`} />;
};

const LessonDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { courseId, levelId, lessonId } = params;
  
  const [openSections, setOpenSections] = useState({
    warmup: true,
    presentation: false,
    practice: false,
    production: false,
    homework: false
  });
  
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Convert string params to integers
  const courseIdInt = parseInt(courseId, 10);
  const levelIdInt = parseInt(levelId, 10);
  const lessonIdInt = parseInt(lessonId, 10);
  
  const lessonData = mockLessonData[courseIdInt]?.[levelIdInt]?.[lessonIdInt];
  
  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Dars topilmadi</h2>
          <p className="text-gray-600 mb-4">So'ralgan dars mavjud emas.</p>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Dars {lessonData.id}: {lessonData.title}
            </h1>
            <p className="text-gray-600 text-sm">
              {lessonData.level} • {lessonData.duration} • {lessonData.type}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Dars haqida</h2>
              <p className="text-gray-600 mb-6">{lessonData.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Maqsadlar</h3>
                  <ul className="space-y-2">
                    {lessonData.goals.map((goal, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Kerakli materiallar</h3>
                  <ul className="space-y-2">
                    {lessonData.materialsNeeded.map((material, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" 
                              style={{ backgroundColor: MAIN_COLOR }}></span>
                        <span className="text-sm text-gray-700">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lesson Steps */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Dars bosqichlari</h2>
              
              {Object.entries(lessonData.lessonSteps).map(([key, step]) => (
                <StepSection
                  key={key}
                  step={key}
                  title={step.title}
                  isOpen={openSections[key]}
                  onToggle={() => toggleSection(key)}
                >
                  <ul className="space-y-2">
                    {step.activities.map((activity, index) => (
                      <li key={index} className="flex items-start">
                        <PlayCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </StepSection>
              ))}
            </div>

            {/* Teaching Tips */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-6 w-6 text-yellow-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">O'qitish maslahatlari</h2>
              </div>
              <ul className="space-y-3">
                {lessonData.teachingTips.map((tip, index) => (
                  <li key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                    <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-yellow-600"></span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Tez-tez uchraydigan xatolar</h2>
              </div>
              <ul className="space-y-3">
                {lessonData.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start p-3 bg-red-50 rounded-lg">
                    <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-red-600"></span>
                    <span className="text-gray-700">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Extra Activities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <PlusCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Qo'shimcha mashqlar</h2>
              </div>
              <ul className="space-y-3">
                {lessonData.extraActivities.map((activity, index) => (
                  <li key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                    <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-green-600"></span>
                    <span className="text-gray-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Dars ma'lumotlari</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Davomiyligi</span>
                  <span className="font-semibold">{lessonData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daraja</span>
                  <span className="font-semibold">{lessonData.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Turi</span>
                  <span className="font-semibold">{lessonData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Qiyinlik</span>
                  <span className="font-semibold">{lessonData.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Topics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mavzular</h3>
              <div className="flex flex-wrap gap-2">
                {lessonData.topics.map((topic, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Materiallar</h3>
              <div className="space-y-3">
                {lessonData.resources.map((resource, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <ResourceIcon type={resource.type} />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {resource.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {resource.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {resource.size || resource.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigatsiya</h3>
              <div className="space-y-2">
                <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">
                  ← Avvalgi dars
                </button>
                <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">
                  Keyingi dars →
                </button>
                <button 
                  onClick={() => router.push(`/teacher/guide/${courseId}/${levelId}`)}
                  className="w-full p-2 text-left text-sm hover:bg-gray-50 rounded transition-colors"
                  style={{ color: MAIN_COLOR }}
                >
                  ↑ Level sahifasiga qaytish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetailPage;