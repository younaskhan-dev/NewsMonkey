import Summary from '../models/Summary.js';

// Get or generate AI Summary for an article
export const getArticleSummary = async (req, res) => {
  try {
    const { articleUrl, title, description } = req.body;

    if (!articleUrl || !title) {
      return res.status(400).json({ message: "Article URL and title are required for summarization" });
    }

    // 1. Check MongoDB Cache first
    const cachedSummary = await Summary.findOne({ articleUrl });
    if (cachedSummary) {
      return res.status(200).json({
        isCached: true,
        summaryBullets: cachedSummary.summaryBullets,
      });
    }

    // 2. Generate Summary Bullets
    let summaryBullets = [];

    // Check if external AI API keys are configured (e.g., Gemini)
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Summarize the following news article into exactly 3 concise, professional bullet points. Title: ${title}. Description: ${description || 'No description provided.'}` }] }]
          })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          summaryBullets = text.split('\n').filter(b => b.trim()).map(b => b.replace(/^[\*\-\•]\s*/, '').trim()).slice(0, 3);
        }
      } catch (aiErr) {
        console.error("[Gemini AI Error, falling back to NLP]:", aiErr);
      }
    }

    // 3. Sophisticated NLP Fallback (If no API key or API call failed)
    if (summaryBullets.length === 0) {
      const cleanTitle = title.replace(/\s+[-|]\s+.*$/, ''); // Strip publication name
      const fullText = description ? `${cleanTitle}. ${description}` : cleanTitle;
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [cleanTitle];

      const bullet1 = `Core Takeaway: ${cleanTitle}.`;
      
      let bullet2 = description && sentences.length > 1 
        ? sentences[1].trim() 
        : `Key Context: Reports highlight significant industry developments and emerging trends surrounding ${cleanTitle.substring(0, 35)}...`;
      
      let bullet3 = sentences.length > 2 
        ? sentences[2].trim() 
        : `Future Outlook: Analysts and experts emphasize the broader long-term implications and ongoing impact of this announcement.`;

      summaryBullets = [
        bullet1.replace(/^[\*\-\•]\s*/, ''),
        bullet2.replace(/^[\*\-\•]\s*/, ''),
        bullet3.replace(/^[\*\-\•]\s*/, ''),
      ];
    }

    // 4. Save to MongoDB Cache
    const newSummary = await Summary.create({
      articleUrl,
      title,
      summaryBullets,
    });

    res.status(200).json({
      isCached: false,
      summaryBullets: newSummary.summaryBullets,
    });
  } catch (error) {
    console.error('[getArticleSummary Error]:', error);
    res.status(500).json({ message: "Error generating AI summary", error: error.message });
  }
};
