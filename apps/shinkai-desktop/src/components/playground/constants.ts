export const WORKFLOW_EXAMPLES: Record<
  string,
  {
    name: string;
    message: string;
    workflow: string;
  }
> = {
  example1: {
    name: 'Full Document Summarizer',
    message: 'Example message 1',
    workflow: `workflow Extensive_summary v0.1 {
      step Initialize {
          $PROMPT = "Summarize this: "
          $EMBEDDINGS = call process_embeddings_in_job_scope()
      }
      step Summarize {
          $RESULT = call multi_inference($PROMPT, $EMBEDDINGS)
      }
    } @@official.shinkai`,
  },
  example2: {
    name: 'Example 2',
    message: 'Example message 2',
    workflow: 'Example workflow 2',
  },
};

export const BAML_EXAMPLES: Record<
  string,
  {
    name: string;
    bamlInput: string;
    dslFile: string;
    functionName: string;
    paramName: string;
  }
> = {
  extractResume: {
    name: 'Extract Resume',
    bamlInput: `John Doe
Education
- University of California, Berkeley
  - B.S. in Computer Science
  - 2020
Skills
- Python
- Java
- C++`,
    dslFile: `class Resume {
  name string
  education Education[] @description("Extract in the same order listed")
  skills string[] @description("Only include programming languages")
}

class Education {
  school string
  degree string
  year int
}

function ExtractResume(resume_text: string) -> Resume {
  client ShinkaiProvider

  // The prompt uses Jinja syntax. Change the models or this text and watch the prompt preview change!
  prompt #"
    Parse the following resume and return a structured representation of the data in the schema below.

    Resume:
    ---
    {{ resume_text }}
    ---

    {# special macro to print the output instructions. #}
    {{ ctx.output_format }}

    JSON:
  "#
}`,
    functionName: 'ExtractResume',
    paramName: 'resume_text',
  },
  classifyMessage: {
    name: 'Classify Message',
    bamlInput: `I can't access my account using my login credentials. I havent received the promised reset password email. Please help.`,
    dslFile: `class Message {
  text string
  category string
}

function ClassifyMessage(message_text: string) -> Message {
  client ShinkaiProvider

  prompt #"
    Classify the following message into appropriate categories.

    Message:
    ---
    {{ message_text }}
    ---

    JSON:
  "#
}`,
    functionName: 'ClassifyMessage',
    paramName: 'message_text',
  },
  ragWithCitations: {
    name: 'RAG with Citations',
    bamlInput: `{
        "documents": [
          {
            "title": "OmniParser Abstract",
            "link": "https://arxiv.org",
            "text": "- OmniParser for Pure Vision Based GUI Agent Yadong Lu 1 , Jianwei Yang 1 , Yelong Shen 2 , Ahmed Awadallah 1  1 Microsoft Research 2 Microsoft Gen AI {yadonglu, jianwei.yang, yeshe, ahmed.awadallah}@microsoft.com Abstract  (Source: 2408.00203v1.pdf, Section: )"
          },
          {
            "title": "OmniParser Page 1",
            "link": "https://arxiv.org",
            "text": "- Yadong Lu 1 , Jianwei Yang 1 , Yelong Shen 2 , Ahmed Awadallah 1 (Source: 2408.00203v1.pdf, Page: [1]) - its usage to web browsing tasks. We aim to build a general approach that works on a variety of platforms and applications. (Source: 2408.00203v1.pdf, Page: [2]) - In this work, we argue that previous pure vision-based screen parsing techniques are not satisfactory, which lead to significant underestimation of GPT-4V model's understanding capabilities. And a reliable vision-based screen parsing method that works well on general user interface is a key to improve the robustness of the agentic workflow on various operating systems and (Source: 2408.00203v1.pdf, Page: [2])"
          },
          {
            "title": "OmniParser Page 2",
            "link": "https://arxiv.org",
            "text": "- applications. We present OMNIPARSER, a general screen parsing tool to extract information from UI screenshot into structured bounding box and labels which enhances GPT-4V's performance in action prediction in a variety of user tasks. (Source: 2408.00203v1.pdf, Page: [2]) - We list our contributions as follows: (Source: 2408.00203v1.pdf, Page: [2]) - • We curate a interactable region detection dataset using bounding boxes extracted from DOM tree of popular webpages. (Source: 2408.00203v1.pdf, Page: [2]) - • We propose OmniParser, a pure vision-based user interface screen parsing method that combines multiple finetuned models for better screen understanding and easier grounded action generation. (Source: 2408.00203v1.pdf, Page: [2]) - • We evaluate our approach on ScreenSpot, Mind2Web and AITW benchmark, and demonstrated a significant improvement from the original GPT-4V baseline without requiring additional input other than screenshot. (Source: 2408.00203v1.pdf, Page: [2])"
          },
          {
            "title": "OmniParser Acknowledgement",
            "link": "https://arxiv.org",
            "text": "- Acknowledgement (Source: 2408.00203v1.pdf, Page: [9]) - We would like to thank Corby Rosset and authors of ClueWeb22 for providing the seed urls for which we use to collect data to finetune the interactable region detection model. The data collection pipeline adapted AutoGen's multimodal websurfer code for extracting interatable elements in DOM, for which we thank Adam Fourney. We also thank Dillon DuPont for providing the (Source: 2408.00203v1.pdf, Page: [9]) - processed version of mind2web benchmark. (Source: 2408.00203v1.pdf, Page: [9])"
          },
          {
            "title": "OmniParser References",
            "link": "https://arxiv.org",
            "text": "- References (Source: 2408.00203v1.pdf, Page: [9]) - [BEH + 23] Rohan Bavishi, Erich Elsen, Curtis Hawthorne, Maxwell Nye, Augustus Odena, Arushi Somani, and Sa ˘ gnak Ta¸sırlar. Introducing our multimodal models, 2023. (Source: 2408.00203v1.pdf, Page: [9]) - [BZX + 21] Chongyang Bai, Xiaoxue Zang, Ying Xu, Srinivas Sunkara, Abhinav Rastogi, Jindong Chen, and Blaise Aguera y Arcas. Uibert: Learning generic multimodal representations for ui understanding, 2021. (Source: 2408.00203v1.pdf, Page: [9]) - [CSC + 24] Kanzhi Cheng, Qiushi Sun, Yougang Chu, Fangzhi Xu, Yantao Li, Jianbing Zhang, and Zhiyong Wu. Seeclick: Harnessing gui grounding for advanced visual gui agents, 2024. (Source: 2408.00203v1.pdf, Page: [9])"
          }
        ]
      }`,
    dslFile: `class Citation {
        number int @description(#"
          the index in this array
        "#)
        documentTitle string
        sourceLink string
        relevantTextFromDocument string @alias("relevantSentenceFromDocument") @description(#"
          The relevant text from the document that supports the answer. This is a citation. You must quote it EXACTLY as it appears in the document with any special characters it contains. The text should be contiguous and not broken up. You may NOT summarize or skip sentences. If you need to skip a sentence, start a new citation instead.
        "#)
      }

      class Answer {
        answersInText Citation[] @alias("relevantSentencesFromText")
        answer string @description(#"
          An answer to the user's question that MUST cite sources from the relevantSentencesFromText. Like [0]. If multiple citations are needed, write them like [0][1][2].
        "#)
      }

      class Document {
        title string
        text string
        link string
      }
      class Context {
        documents Document[]
      }

      function AnswerQuestion(context: Context) -> Answer {
        client ShinkaiProvider
        prompt #"
          Answer the following question using the given context below. Make it extensive and detailed.
          CONTEXT:
          {% for document in context.documents %}
          ----
          DOCUMENT TITLE: {{  document.title }}
          {{ document.text }}
          DOCUMENT LINK: {{ document.link }}
          ----
          {% endfor %}

          {{ ctx.output_format }}

          {{ _.role("user") }}
          QUESTION: Summarize this in detail.

          ANSWER:
        "#
      }`,
    functionName: 'AnswerQuestion',
    paramName: 'context',
  },
};
