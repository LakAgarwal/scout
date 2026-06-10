import streamlit as st
import os

st.set_page_config(
    page_title="Scout — Market Intelligence Platform",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (premium aesthetics)
st.markdown("""
    <style>
    .main {
        background-color: #0d1117;
        color: #c9d1d9;
    }
    h1, h2, h3 {
        color: #58a6ff !important;
        font-family: 'Outfit', 'Inter', sans-serif;
    }
    .stButton>button {
        background-color: #21262d;
        color: #c9d1d9;
        border: 1px solid #30363d;
        border-radius: 6px;
        transition: 0.3s;
    }
    .stButton>button:hover {
        border-color: #58a6ff;
        color: #58a6ff;
        background-color: #161b22;
    }
    .card {
        background-color: #161b22;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #30363d;
        margin-bottom: 15px;
    }
    </style>
""", unsafe_allow_html=True)

st.title("🔍 Scout — AI Market Intelligence & Competitor Research")
st.subheader("Your AI-powered assistant for monitoring industries, analyzing competitors, and semantic research.")

st.markdown("---")

col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    <div class="card">
        <h3>📊 Market Dashboard</h3>
        <p>Monitor industry trends, keyword frequencies, and sentiment over time. Get a real-time overview of current market activity.</p>
        <p>👈 Navigate to the <b>Dashboard</b> page to view sentiment analytics.</p>
    </div>
    <div class="card">
        <h3>🧭 Market Explorer</h3>
        <p>Explore gathered news articles by industry, read AI-generated summaries, track trending topics, and query articles using <b>Semantic Vector Search</b>.</p>
        <p>👈 Navigate to the <b>Market Explorer</b> page to search and explore articles.</p>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="card">
        <h3>🤖 AI Analyst</h3>
        <p>Ask complex research questions and let Scout generate comprehensive, structured reports backed by real citations from the article database.</p>
        <p>👈 Navigate to the <b>AI Analyst</b> page to chat with Scout.</p>
    </div>
    <div class="card">
        <h3>⚔️ Competitor Intelligence</h3>
        <p>Compare competitors' mention volume and sentiment trends side by side, and generate SWOT analyses on the fly.</p>
        <p>👈 Navigate to the <b>Competitor Intelligence</b> page to begin research.</p>
    </div>
    """, unsafe_allow_html=True)

st.sidebar.success("Select a page above to start.")
st.sidebar.markdown("""
---
### System Status
* **Database:** Connected 🟢
* **Vector Store (Qdrant):** Connected 🟢
* **AI Model (Gemini):** Ready 🟢
""")
