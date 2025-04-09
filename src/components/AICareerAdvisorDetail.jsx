import React, { useState } from 'react';
import ImageViewer from './ImageViewer'; // 导入 ImageViewer 组件

const AICareerAdvisorDetail = () => {
  const [activeTab, setActiveTab] = useState('architecture');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  // OSS 图片基础路径
  const baseImageUrl = 'https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/chatbot';

  // 打开图片查看器
  const openImageViewer = (imageSrc) => {
    setCurrentImage(imageSrc);
    setViewerOpen(true);
  };

  // 关闭图片查看器
  const closeImageViewer = () => {
    setViewerOpen(false);
  };

  // 定义图表和描述内容
  const tabContent = {
    architecture: {
      title: "Chatbot Architecture",
      description: "The AI Career Advisor uses a sophisticated architecture that processes user queries through multiple specialized components to deliver tailored career guidance.",
      image: `${baseImageUrl}/workflow_architecture.png`,
      details: [
        "Identifies query type through advanced classification",
        "Extracts user context to personalize responses",
        "Retrieves relevant knowledge from specialized knowledge bases",
        "Processes information through LLM to generate human-like responses",
        "Provides data visualizations when appropriate for better insight delivery"
      ]
    },
    interaction: {
      title: "User Interaction Flow",
      description: "The sequence diagram shows how users interact with the AI Career Advisor and how information flows through the system to generate responses.",
      image: `${baseImageUrl}/interaction_sequence.png`,
      details: [
        "User submits career-related queries",
        "System classifies query by type (job market data, career advice, etc.)",
        "User context is extracted to improve relevance",
        "Knowledge base provides domain-specific information",
        "LLM generates natural language responses based on retrieved knowledge",
        "Visualization service provides interactive data views when requested"
      ]
    },
    implementation: {
      title: "Dify.ai Implementation",
      description: "The AI Career Advisor is implemented using Dify.ai workflow, which provides a structured approach to building conversational AI applications.",
      image: `${baseImageUrl}/implementation_process.png`,
      details: [
        "Created application framework in Dify.ai",
        "Uploaded structured knowledge base with career insights",
        "Configured prompt templates for different query types",
        "Designed conversation flow with logic branches",
        "Set up retrieval nodes for knowledge access",
        "Added external integrations for visualization",
        "Configured LLM parameters for optimal response quality"
      ]
    },
    analysis: {
      title: "Knowledge Generation Process",
      description: "Our ML analysis pipeline transforms raw data into structured knowledge that powers the AI Career Advisor's responses.",
      image: `${baseImageUrl}/analysis_process.png`,
      details: [
        "Follows CRISP-DM methodology for structured data analysis",
        "Begins with business questions about career insights",
        "Data exploration identifies patterns in employment data",
        "Advanced analytics extract meaningful insights",
        "Machine learning models identify key factors and relationships",
        "Conclusions are structured into a knowledge base format",
        "Knowledge is embedded and made retrievable in Dify.ai"
      ]
    }
  };

  // 渲染当前选中的选项卡内容
  const renderTabContent = () => {
    const content = tabContent[activeTab];

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{content.title}</h2>
        <p className="text-gray-700 mb-6">{content.description}</p>

        <div className="mb-6 flex justify-center">
          <img
            src={content.image}
            alt={content.title}
            className="max-w-full h-auto rounded-lg shadow-lg cursor-zoom-in"
            style={{ maxHeight: '500px' }}
            onClick={() => openImageViewer(content.image)}
          />
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Key Components:</h3>
          <ul className="list-disc pl-6 space-y-2">
            {content.details.map((detail, index) => (
              <li key={index} className="text-gray-700">{detail}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl">AI Career Advisor Platform</h2>
        <div className="text-sm text-gray-500">
          Powered by Dify.ai and LLM Technology
        </div>
      </div>

      <div className="mb-6 border-b">
        <div className="flex flex-wrap">
          <button
            className={`pb-2 px-4 ${activeTab === 'architecture' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            Architecture
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'interaction' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('interaction')}
          >
            Interaction Flow
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'implementation' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('implementation')}
          >
            Implementation
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'analysis' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            Knowledge Generation
          </button>
        </div>
      </div>

      {renderTabContent()}

      {/* 添加图片查看器组件 */}
      <ImageViewer
        src={currentImage}
        alt="Enlarged diagram"
        isOpen={viewerOpen}
        onClose={closeImageViewer}
      />

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Try AI Career Advisor</h3>
        <p className="text-gray-700 mb-4">
          The AI Career Advisor can help with career planning, job market insights, salary information, and personalized guidance based on your skills and interests.
        </p>
        <a 
          href="#" 
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            window.open('https://chat.dify.ai/c/demo', '_blank');
          }}
        >
          Chat with the Advisor
        </a>
      </div>
    </div>
  );
};

export default AICareerAdvisorDetail;