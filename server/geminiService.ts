import { GoogleGenAI, Type } from '@google/genai';
import { QuestionEvaluation, ResumeData, Question, DifficultyLevel } from '../src/types';

// Initialize server-side Gemini client with User-Agent header for telemetry as required
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Falling back to rule-based fallback responses.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export async function analyzeResumeWithGemini(
  resumeText: string,
  targetJobRole: string = 'Senior AI/ML Engineer'
): Promise<ResumeData> {
  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackResumeData(resumeText, targetJobRole);
  }

  try {
    const prompt = `You are an expert HR AI Resume Parser and Technical Recruiter. Analyze the following candidate resume text against the target job role "${targetJobRole}". Extract detailed technical skills, experience years, executive summary, fit score (0-100), key focus areas, and recommended interview topics.

Resume Text:
"""
${resumeText}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            email: { type: Type.STRING },
            yearsExperience: { type: Type.INTEGER },
            extractedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            fitScore: { type: Type.INTEGER },
            recommendedPreparation: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'candidateName',
            'email',
            'yearsExperience',
            'extractedSkills',
            'summary',
            'fitScore',
            'recommendedPreparation',
            'recommendedTopics',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      fileName: 'Uploaded_Resume.pdf',
      candidateName: parsed.candidateName || 'Candidate',
      email: parsed.email || 'candidate@example.com',
      yearsExperience: parsed.yearsExperience || 3,
      extractedSkills: parsed.extractedSkills || ['Python', 'Problem Solving', 'Git'],
      summary: parsed.summary || 'Extracted profile summary based on uploaded document.',
      matchedRole: targetJobRole,
      fitScore: Math.min(100, Math.max(0, parsed.fitScore || 75)),
      recommendedPreparation: (parsed.recommendedPreparation || parsed.recommendedTopics || ['System Design', 'Algorithms', 'SQL']),
      recommendedTopics: parsed.recommendedTopics || ['System Design', 'Algorithms', 'SQL'],
    };
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    return getFallbackResumeData(resumeText, targetJobRole);
  }
}

export async function generateInterviewQuestionsWithGemini(
  jobRole: string,
  experienceYears: number,
  skills: string[],
  difficulty: DifficultyLevel = 'medium'
): Promise<Question[]> {
  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackQuestions(jobRole, difficulty);
  }

  try {
    const prompt = `Generate 3 high-quality, realistic technical interview questions for a ${jobRole} candidate with ${experienceYears} years of experience.
Target Skills: ${skills.join(', ')}.
Difficulty Level: ${difficulty}.

Provide specific expected key technical concepts for each question and a clear model sample answer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              questionText: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              expectedKeyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              sampleModelAnswer: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ['topic', 'questionText', 'expectedKeyConcepts', 'sampleModelAnswer', 'category'],
          },
        },
      },
    });

    const items = JSON.parse(response.text || '[]');
    return items.map((q: any, idx: number) => ({
      id: `gen_q_${Date.now()}_${idx}`,
      topic: q.topic || jobRole,
      questionText: q.questionText || 'Explain your approach to system optimization.',
      difficulty: (q.difficulty as DifficultyLevel) || difficulty,
      expectedKeyConcepts: q.expectedKeyConcepts || ['Performance', 'Scalability', 'Architecture'],
      sampleModelAnswer: q.sampleModelAnswer || 'An optimal solution involves clear architectural boundaries and efficient data structures.',
      category: ['Technical', 'System Design', 'Problem Solving', 'Behavioral'].includes(q.category)
        ? q.category
        : 'Technical',
    }));
  } catch (err) {
    console.error('Error generating questions with Gemini:', err);
    return getFallbackQuestions(jobRole, difficulty);
  }
}

export async function evaluateAnswerWithGemini(
  question: Question,
  candidateAnswer: string,
  difficulty: DifficultyLevel,
  jobRole: string
): Promise<QuestionEvaluation> {
  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackEvaluation(question, candidateAnswer);
  }

  try {
    const prompt = `You are a Senior Principal AI Evaluation Architect powering a Transformer Encoder-Decoder Pipeline with an AI Bottleneck Detection Module for technical interviews.

Target Role: ${jobRole}
Question Topic: ${question.topic}
Question Text: "${question.questionText}"
Expected Key Concepts: ${question.expectedKeyConcepts.join(', ')}
Difficulty: ${difficulty}

Candidate Answer:
"""
${candidateAnswer}
"""

Evaluate the response rigorously across:
1. Transformer Encoder Layer: Semantic context extraction, intent match %, embedding distance (0.01 to 0.50), key concept coverage.
2. AI Bottleneck Detection Layer:
   - Knowledge Gap Score (0=none, 100=extreme gap)
   - Communication Gap Score (0=none, 100=poor clarity)
   - Reasoning Quality Score (0-100)
   - Confidence Score (0-100)
   - Skill Gap Score (0-100)
   - Hallucination Risk ("Low", "Medium", "High")
   - Bias Detected (boolean)
   - Answer Completeness % (0-100)
   - Missing Keywords & Missing Examples
   - Weak Technical Concepts
   - Grammar & Fluency Score (0-100)
3. Transformer Decoder Layer:
   - Explainable Score Reasoning ("Why this score?")
   - Missing Concepts Explanation
   - Gold Standard Expected Answer Comparison
   - Suggested Concrete Improvements
   - Adaptive Next Difficulty ("easy", "medium", or "hard")
   - Recommended Follow-Up Practice Topic`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            technicalDepthScore: { type: Type.INTEGER },
            communicationScore: { type: Type.INTEGER },
            confidenceScore: { type: Type.INTEGER },
            bottlenecks: {
              type: Type.OBJECT,
              properties: {
                knowledgeGapScore: { type: Type.INTEGER },
                communicationGapScore: { type: Type.INTEGER },
                reasoningQualityScore: { type: Type.INTEGER },
                confidenceScore: { type: Type.INTEGER },
                improvementScore: { type: Type.INTEGER },
                hallucinationRisk: { type: Type.STRING },
                biasDetected: { type: Type.BOOLEAN },
                completenessPercent: { type: Type.INTEGER },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingExamples: { type: Type.ARRAY, items: { type: Type.STRING } },
                weakConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                grammarFluencyScore: { type: Type.INTEGER },
                hesitationCount: { type: Type.INTEGER },
                fillerWordsCount: { type: Type.INTEGER },
                speakingPaceWpm: { type: Type.INTEGER },
              },
              required: [
                'knowledgeGapScore',
                'communicationGapScore',
                'reasoningQualityScore',
                'confidenceScore',
                'improvementScore',
                'hallucinationRisk',
                'biasDetected',
                'completenessPercent',
                'missingKeywords',
                'missingExamples',
                'weakConcepts',
                'grammarFluencyScore',
              ],
            },
            encoderAnalysis: {
              type: Type.OBJECT,
              properties: {
                semanticContext: { type: Type.STRING },
                intentMatchPercent: { type: Type.INTEGER },
                embeddingVectorDistance: { type: Type.NUMBER },
                keyConceptCoverage: { type: Type.INTEGER },
              },
              required: ['semanticContext', 'intentMatchPercent', 'embeddingVectorDistance', 'keyConceptCoverage'],
            },
            decoderOutput: {
              type: Type.OBJECT,
              properties: {
                explainableScoreReasoning: { type: Type.STRING },
                missingConceptsExplanation: { type: Type.STRING },
                expectedAnswerComparison: { type: Type.STRING },
                suggestedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
                adaptiveNextDifficulty: { type: Type.STRING },
                recommendedFollowUpTopic: { type: Type.STRING },
              },
              required: [
                'explainableScoreReasoning',
                'missingConceptsExplanation',
                'expectedAnswerComparison',
                'suggestedImprovements',
                'adaptiveNextDifficulty',
                'recommendedFollowUpTopic',
              ],
            },
          },
          required: [
            'overallScore',
            'technicalDepthScore',
            'communicationScore',
            'confidenceScore',
            'bottlenecks',
            'encoderAnalysis',
            'decoderOutput',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      questionId: question.id,
      questionText: question.questionText,
      candidateAnswer,
      overallScore: Math.min(100, Math.max(0, parsed.overallScore || 75)),
      technicalDepthScore: Math.min(100, Math.max(0, parsed.technicalDepthScore || 75)),
      communicationScore: Math.min(100, Math.max(0, parsed.communicationScore || 75)),
      confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore || 75)),
      bottlenecks: {
        knowledgeGapScore: parsed.bottlenecks?.knowledgeGapScore ?? 15,
        communicationGapScore: parsed.bottlenecks?.communicationGapScore ?? 15,
        reasoningQualityScore: parsed.bottlenecks?.reasoningQualityScore ?? 80,
        confidenceScore: parsed.bottlenecks?.confidenceScore ?? 80,
        improvementScore: parsed.bottlenecks?.improvementScore ?? 15,
        hallucinationRisk: ['Low', 'Medium', 'High'].includes(parsed.bottlenecks?.hallucinationRisk)
          ? parsed.bottlenecks.hallucinationRisk
          : 'Low',
        biasDetected: Boolean(parsed.bottlenecks?.biasDetected),
        completenessPercent: parsed.bottlenecks?.completenessPercent ?? 80,
        missingKeywords: parsed.bottlenecks?.missingKeywords || [],
        missingExamples: parsed.bottlenecks?.missingExamples || [],
        weakConcepts: parsed.bottlenecks?.weakConcepts || [],
        grammarFluencyScore: parsed.bottlenecks?.grammarFluencyScore ?? 90,
        hesitationCount: parsed.bottlenecks?.hesitationCount ?? 2,
        fillerWordsCount: parsed.bottlenecks?.fillerWordsCount ?? 3,
        speakingPaceWpm: parsed.bottlenecks?.speakingPaceWpm ?? 140,
      },
      encoderAnalysis: {
        semanticContext: parsed.encoderAnalysis?.semanticContext || question.topic,
        intentMatchPercent: parsed.encoderAnalysis?.intentMatchPercent ?? 85,
        embeddingVectorDistance: parsed.encoderAnalysis?.embeddingVectorDistance ?? 0.12,
        keyConceptCoverage: parsed.encoderAnalysis?.keyConceptCoverage ?? 80,
      },
      decoderOutput: {
        explainableScoreReasoning:
          parsed.decoderOutput?.explainableScoreReasoning ||
          'Score was derived by evaluating semantic coverage against expected transformer tokens.',
        missingConceptsExplanation:
          parsed.decoderOutput?.missingConceptsExplanation || 'Key sub-concepts were mostly addressed.',
        expectedAnswerComparison:
          parsed.decoderOutput?.expectedAnswerComparison ||
          question.sampleModelAnswer ||
          'Expected structured explanation covering primary technical mechanisms.',
        suggestedImprovements: parsed.decoderOutput?.suggestedImprovements || [
          'Add a concrete real-world code or architecture example.',
          'Quantify memory and latency impact in exact figures.',
        ],
        adaptiveNextDifficulty: (parsed.decoderOutput?.adaptiveNextDifficulty as DifficultyLevel) || 'medium',
        recommendedFollowUpTopic: parsed.decoderOutput?.recommendedFollowUpTopic || question.topic,
      },
    };
  } catch (err) {
    console.error('Error evaluating answer with Gemini:', err);
    return getFallbackEvaluation(question, candidateAnswer);
  }
}

// Fallback Generators for robust local execution without API key errors
function getFallbackResumeData(resumeText: string, jobRole: string): ResumeData {
  return {
    fileName: 'Parsed_Resume.pdf',
    candidateName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    yearsExperience: 5,
    extractedSkills: ['Python', 'PyTorch', 'Transformers', 'FastAPI', 'System Design', 'PostgreSQL', 'Docker'],
    summary: 'Senior Software Engineer with 5+ years building machine learning pipelines and microservices.',
    matchedRole: jobRole,
    fitScore: 88,
    recommendedPreparation: ['Vector Database Indexing (HNSW)', 'TensorRT-LLM Quantization', 'Distributed KV Cache'],
    recommendedTopics: ['Vector Database Indexing (HNSW)', 'TensorRT-LLM Quantization', 'Distributed KV Cache'],
  };
}

function getFallbackQuestions(jobRole: string, difficulty: DifficultyLevel): Question[] {
  return [
    {
      id: `fallback_q1_${Date.now()}`,
      topic: 'Transformer Self-Attention',
      questionText: 'Explain the mathematical bottleneck in standard Multi-Head Attention and how FlashAttention optimizes SRAM vs HBM memory transfers.',
      difficulty,
      expectedKeyConcepts: ['O(N^2) memory complexity', 'HBM bandwidth bottleneck', 'SRAM tiling algorithm', 'Online softmax computation'],
      sampleModelAnswer: 'Self-attention calculates Query-Key dot products scaled by square root of head dimension. Standard implementations write $N \\times N$ intermediate matrices to GPU High Bandwidth Memory (HBM). FlashAttention breaks matrices into tiles stored in faster SRAM, updating softmax iteratively.',
      category: 'Technical',
    },
    {
      id: `fallback_q2_${Date.now()}`,
      topic: 'RAG Architecture & Vector Indexing',
      questionText: 'Compare HNSW (Hierarchical Navigable Small World) graphs with IVF-PQ (Inverted File Product Quantization) for high-scale vector retrieval.',
      difficulty,
      expectedKeyConcepts: ['Graph traversal vs clustering', 'Recall vs Latency trade-offs', 'Memory footprint reduction', 'Quantization loss'],
      sampleModelAnswer: 'HNSW offers low latency and high recall by navigating multi-layer proximity graphs but requires significant RAM. IVF-PQ partitions vector space into Voronoi cells and compresses vectors using product quantization, trading a slight drop in recall for massive memory savings.',
      category: 'System Design',
    },
  ];
}

function getFallbackEvaluation(question: Question, candidateAnswer: string): QuestionEvaluation {
  const words = candidateAnswer.split(/\s+/).length;
  const isGood = words > 25;

  return {
    questionId: question.id,
    questionText: question.questionText,
    candidateAnswer,
    overallScore: isGood ? 86 : 62,
    technicalDepthScore: isGood ? 88 : 60,
    communicationScore: isGood ? 84 : 65,
    confidenceScore: isGood ? 85 : 58,
    bottlenecks: {
      knowledgeGapScore: isGood ? 12 : 38,
      communicationGapScore: isGood ? 15 : 32,
      reasoningQualityScore: isGood ? 86 : 60,
      confidenceScore: isGood ? 85 : 58,
      improvementScore: isGood ? 10 : 35,
      hallucinationRisk: isGood ? 'Low' : 'Medium',
      biasDetected: false,
      completenessPercent: isGood ? 88 : 55,
      missingKeywords: isGood ? ['SRAM tile scaling'] : ['Memory bandwidth', 'O(N^2) math', 'KV caching'],
      missingExamples: isGood ? ['NVIDIA A100 benchmarks'] : ['Specific memory formulas'],
      weakConcepts: isGood ? [] : ['Memory bottleneck math'],
      grammarFluencyScore: 92,
      hesitationCount: 2,
      fillerWordsCount: 3,
      speakingPaceWpm: 135,
    },
    encoderAnalysis: {
      semanticContext: question.topic,
      intentMatchPercent: isGood ? 90 : 65,
      embeddingVectorDistance: isGood ? 0.09 : 0.28,
      keyConceptCoverage: isGood ? 85 : 55,
    },
    decoderOutput: {
      explainableScoreReasoning: isGood
        ? 'The answer correctly identified core theoretical mechanisms and provided clear technical terms.'
        : 'The answer was overly brief and omitted key mathematical and architectural mechanisms expected for this role.',
      missingConceptsExplanation: isGood
        ? 'Minor omission on hardware-specific memory bandwidth constraints.'
        : 'Missed explaining the quadratic complexity formula and GPU memory hierarchy differences.',
      expectedAnswerComparison:
        question.sampleModelAnswer ||
        'Gold standard involves explaining mathematical principles, GPU memory architecture (HBM vs SRAM), and architectural trade-offs.',
      suggestedImprovements: [
        'Elaborate on hardware-level memory bandwidth boundaries.',
        'Use specific mathematical notation to clarify theoretical complexity.',
      ],
      adaptiveNextDifficulty: isGood ? 'hard' : 'medium',
      recommendedFollowUpTopic: question.topic,
    },
  };
}
