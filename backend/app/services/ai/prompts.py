"""Prompt templates for LLM analysis functions."""


# --- Gemini Prompts ---

def get_full_audio_analysis_prompt_gemini(question_text: str) -> str:
    """Prompt for full audio analysis using Gemini."""
    return f"""你是托福口语评分专家，请用中文分析这段录音并评分。

题目：{question_text}

评分标准（各维度0-10分）：
1. **Delivery（表达）**: 发音清晰度、流利度、语调自然度
2. **Language Use（语言）**: 语法准确性、词汇丰富度、句式多样性
3. **Topic Development（主题）**: 内容相关性、论证逻辑、细节支撑

请仔细听录音后，用**中文**返回JSON格式的评价：
- delivery: 表达维度分数（0-10）
- language_use: 语言维度分数（0-10）
- topic_development: 主题维度分数（0-10）
- overall_summary: 2-3句话的整体评价
- detailed_feedback: 详细的分析反馈，包含三个维度的具体评价

重要：所有文字内容（overall_summary 和 detailed_feedback）必须用中文书写！"""


def get_chunk_type_analysis_guidance_gemini() -> dict[str, str]:
    """Chunk-type-specific analysis guidance for Gemini."""
    return {
        "opening_statement": """分析这段开头语：
- 发音错误：识别0-5个最严重的发音问题（如果没有发音错误就返回空数组）
- 语法错误：找出语法问题并提供纠正
- 表达优化：建议更地道、更学术的表达方式（例如："good" → "beneficial"）
- 流利度：评价停顿、语速、犹豫
- 内容：thesis陈述是否明确
- 优点：肯定做得好的地方
- 可操作建议：给出具体改进建议""",
        "viewpoint": """分析这段观点阐述：
- 发音错误：识别0-5个最严重的发音问题（如果没有发音错误就返回空数组）
- 语法错误：找出语法问题并提供纠正
- 表达优化：建议更地道、更学术的表达方式
- 流利度：评价停顿、语速、犹豫
- 内容：论证逻辑、细节支撑是否充分
- 优点：肯定做得好的地方
- 可操作建议：给出具体改进建议""",
        "closing_statement": """分析这段结语：
- 发音错误：识别0-5个最严重的发音问题（如果没有发音错误就返回空数组）
- 语法错误：找出语法问题并提供纠正
- 表达优化：建议更地道、更学术的总结表达
- 流利度：评价停顿、语速、犹豫
- 内容：总结是否到位，是否有效回扣主题
- 优点：肯定做得好的地方
- 可操作建议：给出具体改进建议"""
    }


def get_chunk_audio_analysis_prompt_gemini(chunk_text: str, chunk_type: str) -> str:
    """Prompt for chunk audio analysis using Gemini."""
    type_prompts = get_chunk_type_analysis_guidance_gemini()
    
    return f"""你是托福口语评分专家。请仔细听音频，用中文分析这段{chunk_type}。

参考转录文本：{chunk_text}

分析要求：
{type_prompts.get(chunk_type, "分析这段内容的表现")}

请完成以下分析（按优先级）：

1. **发音分析（非常重要！）**：
   - 仔细听音频，识别发音不清晰、不准确或有口音影响的单词
   - 注意：即使是轻微的发音问题也要指出（如重音位置、元音发音、辅音发音）
   - 对于中国学生，特别注意：th/s/z音、r/l音、v/w音、重音位置等常见问题
   - 返回1-5个最需要改进的发音问题（如果发音较好，也要至少指出1-2个可以更完美的地方）
   - 每个问题包含：单词、学生的发音（拼音或近似音标）、正确发音（IPA音标）、具体发音技巧

2. **语法分析**：找出语法错误，提供纠正版本和详细解释

3. **表达优化**：找出可以改进的表达，提供更地道、更学术的版本

4. **流利度评价**：评价语速、停顿、犹豫、连读情况

5. **内容逻辑**：评价论证的相关性和逻辑性

6. **优点强化**：肯定学生做得好的地方（正面反馈很重要！）

7. **可操作建议**：针对上述问题，提供3-5条具体的、可操作的改进建议

重要提示：
- 所有文字内容必须用中文
- **pronunciation_issues 不要返回空数组！** 即使发音整体不错，也要指出可以改进的地方
- 发音分析要基于实际听到的音频，不仅仅是看文本
- 提供具体的例子和建议，不要泛泛而谈
- 音标要准确（使用IPA国际音标）"""


# --- OpenAI Prompts ---

def get_chunk_transcript_system_prompt() -> str:
    """System prompt for chunking transcript by content."""
    return """
你是一名专业的英语老师，分析这段文本，识别其内容结构：

规则：
1. 第一块一般是 opening_statement（开头语），但是有时候没有。
2. 后续是观点和支持细节，chunk_type为 viewpoint
3. 如果最后有总结句，chunk_type为 closing_statement
4. 不要过度拆分观点！一个观点及其展开（解释、例子）应属于同一个 chunk。
5，有些观点可能会以一种很微妙的方式出现，先理解整段文本，再决定如何分块。
6. 根据内容逻辑动态确定分块数量。不要受“通常3-5块”的限制。如果内容较短，完全可以只有 2 个块（1个开头 + 1个观点）。不要为了凑数而强行拆分单一观点。

以下是个例子，返回JSON格式：
{
  "chunks": [
    {"chunk_id": 0, "chunk_type": "opening_statement", "start": 0.0, "end": 5.2, "text": "完整文本"},
    {"chunk_id": 1, "chunk_type": "viewpoint", "start": 5.2, "end": 22.1, "text": "完整文本"},
    {"chunk_id": 2, "chunk_type": "viewpoint", "start": 22.1, "end": 40.0, "text": "完整文本"},
    {"chunk_id": 3, "chunk_type": "closing_statement", "start": 40.0, "end": 45.0, "text": "完整文本"}
  ]
}

每个chunk的text字段必须包含该时间段内的完整文本内容。"""


def get_full_audio_analysis_prompt_openai(question_text: str) -> str:
    """Prompt for full audio analysis using OpenAI."""
    return f"""托福口语评分专家，分析录音并评分。

问题：{question_text}

评分标准（各0-10分）：
1. Delivery: 发音、流利度、语调
2. Language Use: 语法、词汇、句式
3. Topic Development: 内容相关性、逻辑

输出格式（中文markdown）：

## 整体评分
- Delivery: X/10
- Language Use: X/10
- Topic Development: X/10

## 整体评价
2-3句总结

## 详细分析
具体分析"""


def get_chunk_type_analysis_guidance_openai() -> dict[str, str]:
    """Chunk-type-specific analysis guidance for OpenAI."""
    return {
        "opening_statement": """分析这段开头语：
- 发音错误：识别1-5个最严重的发音问题（如果没有就说明发音很好）
- 语法错误：找出语法问题并提供纠正
- 表达优化：建议更地道、更学术的表达方式
- 流利度：评价停顿、语速、犹豫
- 内容：thesis陈述是否明确
- 优点：肯定做得好的地方
- 可操作建议：给出具体改进建议""",
        "viewpoint": """分析这段观点阐述：
- 发音错误：识别1-5个最严重的发音问题（如果没有就说明发音很好）
- 语法错误：找出语法问题并提供纠正
- 表达优化：建议更地道、更学术的表达方式
- 流利度：评价停顿、语速、犹豫
- 内容：论证逻辑、细节支撑是否充分
- 优点：肯定做得好的地方
- 可操作建议：给出具体改进建议""",
        "closing_statement": """分析这段结语：
- 发音错误：识别1-5个最严重的发音问题
- 语法错误：找出语法问题并提供纠正
- 表达优化：建议更地道、更学术的总结表达
- 流利度：评价停顿、语速、犹豫
- 内容：总结是否到位，是否有效回扣主题
- 优点：肯定做得好的地方
- 可操作建议：给出具体改进建议"""
    }


def get_chunk_audio_analysis_prompt_openai(chunk_text: str, chunk_type: str) -> str:
    """Prompt for chunk audio analysis using OpenAI."""
    type_prompts = get_chunk_type_analysis_guidance_openai()
    
    return f"""你是托福口语评分专家。请仔细听音频，用中文分析这段{chunk_type}。

参考转录文本：{chunk_text}

{type_prompts.get(chunk_type, "分析这段内容的表现")}

请按以下结构输出（中文markdown格式）：

## 整体评价
2-3句话总结这段内容的表现

## 发音分析
列出发音问题（如果有）：
- 单词：[错误单词]
  - 你的发音：[学生发音]
  - 正确发音：[IPA音标]
  - 技巧：[具体发音建议]

## 语法问题
列出语法错误（如果有）：
- 原句：[错误句子]
- 纠正：[正确句子]
- 解释：[为什么错误，语法规则]
- 类型：[错误类型，如时态、主谓一致等]

## 表达建议
列出可以改进的表达（如果有）：
- 原表达：[学生的表达]
- 改进：[更好的表达]
- 原因：[为什么更好]

## 流利度评价
评价语速、停顿、犹豫情况

## 内容评价
评价逻辑、相关性、细节支撑

## 优点
列出做得好的地方（至少1-2点）

## 改进建议
给出3-5条具体的、可操作的改进建议，每条标注类别（发音/语法/词汇/结构/流利度）

重要：所有内容必须用中文！"""


def get_parse_global_evaluation_system_prompt() -> str:
    """System prompt for parsing global evaluation from text."""
    return "从评价文本中提取三项分数（各0-10分）和文字评价。"


def get_parse_chunk_feedback_system_prompt() -> str:
    """System prompt for parsing chunk feedback from markdown."""
    return """从音频分析的markdown文本中提取结构化反馈。

要求：
1. 识别发音问题（pronunciation_issues）：单词、学生发音、正确发音、技巧
2. 识别语法错误（grammar_issues）：原句、纠正、解释、错误类型
3. 表达建议（expression_suggestions）：原表达、改进表达、原因
4. 流利度评价（fluency_notes）：语速、停顿、犹豫
5. 内容评价（content_notes）：逻辑、相关性、细节
6. 可操作建议（actionable_tips）：分类和具体建议
7. 优点（strengths）：做得好的地方

所有内容必须用中文。如果某个字段在原文中没有明确信息，可以返回空数组或null。"""
