import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()


def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing")

    return ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    google_api_key=api_key,
    thinking_level="low"
)


def get_rag_chain():
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an enterprise document assistant.

Answer the user's question using ONLY the information
provided in the context below.

If the answer cannot be found in the context, say:
"I could not find the answer in the provided documents."

Do not make up information.

Context:
{context}"""
        ),
        (
            "human",
            "{question}"
        )
    ])

    llm = get_llm()

    chain = prompt | llm

    return chain