from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.vectorstores import FAISS
import os
from dotenv import load_dotenv

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

vectorstore = FAISS.load_local("vectorstores/diagnostic_vectorstore")
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(temperature=0),
    chain_type="stuff",
    retriever=retriever
)

def get_diagnostic_response(question: str) -> str:
    forbidden_keywords = ["medicine", "side effect", "reminder", "dose"]
    if any(word in question.lower() for word in forbidden_keywords):
        return "I'm sorry, I only answer diagnostic questions (symptoms, reports, tests)."
    return qa.run(question)
