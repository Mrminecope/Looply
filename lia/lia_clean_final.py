# Final Clean LIA Code - Enhanced for Looply Social Media
# Zero external dependencies - Fast startup with Looply-specific features

import sys
import json
import random
import time
import os

class LooplyLIA:
    def __init__(self, name="LIA"):
        self.name = name
        self.memory = {}
        self.intelligence_level = 5
        self.session_data = {}
        
        # Looply-specific data
        self.looply_hashtags = {
            'general': ['#LooplyLife', '#Authentic', '#Community', '#Share', '#Connect', '#Vibes', '#RealTalk'],
            'fitness': ['#FitnessJourney', '#HealthyLifestyle', '#WorkoutMotivation', '#FitFam', '#Wellness', '#LooplyFit'],
            'food': ['#Foodie', '#Delicious', '#Cooking', '#Recipe', '#FoodLover', '#LooplyEats'],
            'travel': ['#Travel', '#Adventure', '#Wanderlust', '#Explore', '#Journey', '#LooplyTravel'],
            'tech': ['#Technology', '#Innovation', '#TechLife', '#Digital', '#Future', '#LooplyTech'],
            'art': ['#Art', '#Creative', '#Artist', '#Inspiration', '#Design', '#LooplyArt'],
            'lifestyle': ['#Lifestyle', '#Mindful', '#Balance', '#Growth', '#Positive', '#LooplyDaily'],
            'business': ['#Entrepreneur', '#Business', '#Success', '#Hustle', '#Goals', '#LooplyBiz'],
            'entertainment': ['#Fun', '#Entertainment', '#Music', '#Movies', '#Gaming', '#LooplyFun']
        }
        
        self.caption_templates = [
            "✨ {topic} vibes hitting different today... What's your take? 💭 {hashtags}",
            "Just discovered something amazing about {topic}! 🔥 Who else can relate? {hashtags}",
            "Today's mood: {topic} energy! 💫 Drop your thoughts below 👇 {hashtags}",
            "Let's talk about {topic}... Your perspective matters! 🌟 {hashtags}",
            "Feeling inspired by {topic} lately 🚀 Anyone else on this wavelength? {hashtags}",
            "Real talk about {topic}: it's been a game-changer 💯 {hashtags}",
            "Can we normalize talking about {topic}? It's so important! 🙌 {hashtags}",
            "Plot twist: {topic} just became my new obsession 😍 {hashtags}",
            "Unpopular opinion: {topic} doesn't get enough credit 🤔 {hashtags}",
            "Behind the scenes of my {topic} journey... it's been wild! 📸 {hashtags}"
        ]
        
        self.content_ideas = [
            "💡 Share a behind-the-scenes moment from your day",
            "🎯 Ask your community a thought-provoking question", 
            "📚 Share something new you learned recently",
            "🌟 Highlight someone who inspires you",
            "🎨 Create a poll about preferences in your niche",
            "💭 Share a personal reflection or insight",
            "📸 Post a photo that tells a story",
            "🎉 Celebrate a small win or achievement",
            "🔥 Share a hot take or unpopular opinion",
            "💪 Document your progress on a goal",
            "🤝 Collaborate with another creator",
            "📱 Show your creative process",
            "🎵 Share what you're listening to",
            "🌅 Post your morning routine",
            "🍕 Share what you're eating",
            "✈️ Document a mini adventure",
            "💡 Give a quick tip in your expertise",
            "🎭 Share a funny moment or meme",
            "📖 Recommend something you love",
            "🎊 Celebrate your community"
        ]
        
        self.engagement_strategies = {
            'post_timing': "Best posting times on Looply: 7-9 AM, 12-1 PM, and 7-9 PM when your community is most active!",
            'hashtag_strategy': "Use 5-8 hashtags: mix 2-3 popular ones (#LooplyLife) with 3-5 niche ones specific to your content.",
            'content_mix': "Follow the 80/20 rule: 80% valuable/entertaining content, 20% promotional. Keep it authentic!",
            'community_building': "Respond to comments within the first hour. Ask questions in your captions to spark conversations.",
            'consistency': "Post consistently but prioritize quality over quantity. 3-5 high-quality posts per week beats daily rushed content.",
            'storytelling': "Every post should tell a story. Start with a hook, share the journey, and end with a call-to-action.",
            'visual_appeal': "Good lighting and composition matter more than expensive equipment. Natural light is your best friend!",
            'authenticity': "Share both wins and struggles. Your community connects with real, relatable content more than perfection."
        }

    def learn(self, key, value):
        self.memory[key] = value
        return f"✅ Learned {key}. I'll remember this for our future conversations!"

    def recall(self, key):
        return self.memory.get(key, "🤔 I don't remember that yet. Want to teach me?")

    def generate_caption(self, topic="your experience", style="casual"):
        template = random.choice(self.caption_templates)
        hashtags = self.get_hashtags_for_topic(topic)
        
        # Customize based on style
        if style == "professional":
            template = template.replace("vibes hitting different", "insights resonating strongly")
            template = template.replace("Real talk", "Key insight")
        elif style == "creative":
            template = "🎨 " + template
            
        return template.format(topic=topic, hashtags=" ".join(hashtags[:5]))

    def get_hashtags_for_topic(self, topic_text):
        topic_text = topic_text.lower()
        
        # Determine category based on keywords
        if any(word in topic_text for word in ['fitness', 'workout', 'gym', 'health']):
            category = 'fitness'
        elif any(word in topic_text for word in ['food', 'recipe', 'cooking', 'eat']):
            category = 'food'
        elif any(word in topic_text for word in ['travel', 'vacation', 'trip']):
            category = 'travel'
        elif any(word in topic_text for word in ['tech', 'code', 'programming', 'ai']):
            category = 'tech'
        elif any(word in topic_text for word in ['art', 'design', 'creative']):
            category = 'art'
        elif any(word in topic_text for word in ['business', 'entrepreneur', 'startup']):
            category = 'business'
        elif any(word in topic_text for word in ['music', 'movie', 'game', 'fun']):
            category = 'entertainment'
        elif any(word in topic_text for word in ['lifestyle', 'mindful', 'balance']):
            category = 'lifestyle'
        else:
            category = 'general'
            
        return self.looply_hashtags[category]

    def get_content_ideas(self, niche="general"):
        ideas = random.sample(self.content_ideas, 5)
        niche_specific = f"\n\n🎯 For {niche} creators: Consider sharing industry insights, behind-the-scenes content, or community challenges!"
        return "\n".join([f"{i+1}. {idea}" for i, idea in enumerate(ideas)]) + niche_specific

    def get_engagement_tips(self, focus="general"):
        if focus in self.engagement_strategies:
            return f"💡 {self.engagement_strategies[focus]}"
        
        # Return comprehensive tips
        tips = "🚀 **Looply Engagement Mastery:**\n\n"
        for strategy, tip in self.engagement_strategies.items():
            tips += f"**{strategy.replace('_', ' ').title()}:** {tip}\n\n"
        tips += "🌟 Remember: Authentic engagement beats vanity metrics every time!"
        return tips

    def analyze_trends(self):
        trends = [
            "📈 'Authentic storytelling' posts are performing 300% better this week",
            "🔥 'Behind-the-scenes' content is trending - people love the real you!",
            "💡 Q&A format posts are getting amazing engagement lately",
            "🎯 'Day in my life' content is super popular right now",
            "✨ Carousel posts with tips are getting great reach",
            "🌟 Community challenges are driving massive engagement"
        ]
        return "🎭 **Current Looply Trends:**\n\n" + "\n".join(random.sample(trends, 3))

    def chat(self, user_input):
        user_input = user_input.lower().strip()
        
        # Greetings
        if any(word in user_input for word in ['hello', 'hi', 'hey']):
            greetings = [
                "Hey there! 👋 I'm LIA, your Looply assistant. Ready to create something amazing?",
                "Hello! ✨ I'm here to help you level up your Looply game. What can we work on?",
                "Hi! 🚀 I'm LIA, and I'm excited to help you create engaging content for Looply!"
            ]
            return random.choice(greetings)
        
        # Time requests
        elif 'time' in user_input:
            return f"⏰ Current time is {time.strftime('%H:%M:%S')} - Perfect time to create some content!"
        
        # Jokes
        elif 'joke' in user_input:
            social_jokes = [
                "Why don't social media managers ever get lost? They always know how to find their way to trending! 😄",
                "What do you call a hashtag that works out? #FitTag! 💪",
                "Why did the influencer bring a ladder to the photoshoot? To reach new heights! 📸",
                "What's a content creator's favorite type of music? Algo-rhythms! 🎵"
            ]
            return random.choice(social_jokes)
        
        # Caption generation
        elif any(phrase in user_input for phrase in ['caption', 'post idea', 'create post']):
            topic = "your experience"
            if 'about' in user_input:
                topic = user_input.split('about')[-1].strip()
            elif 'for' in user_input:
                topic = user_input.split('for')[-1].strip()
            return self.generate_caption(topic)
        
        # Hashtag suggestions
        elif 'hashtag' in user_input:
            topic = user_input.replace('hashtag', '').strip()
            if not topic:
                topic = "general content"
            hashtags = self.get_hashtags_for_topic(topic)
            return f"📝 **Hashtag suggestions for {topic}:**\n\n" + " ".join(hashtags) + "\n\n💡 Tip: Mix popular and niche hashtags for best reach!"
        
        # Content ideas
        elif any(phrase in user_input for phrase in ['content idea', 'post suggestion', 'what to post']):
            niche = "general"
            if 'for' in user_input:
                niche = user_input.split('for')[-1].strip()
            return f"💡 **Content Ideas for You:**\n\n{self.get_content_ideas(niche)}"
        
        # Engagement tips
        elif any(phrase in user_input for phrase in ['engagement', 'more likes', 'more followers', 'grow']):
            return self.get_engagement_tips()
        
        # Trends analysis
        elif any(phrase in user_input for phrase in ['trend', 'trending', 'popular', 'viral']):
            return self.analyze_trends()
        
        # Performance tips
        elif any(phrase in user_input for phrase in ['performance', 'analytics', 'metrics']):
            return """📊 **Looply Performance Tips:**

🎯 **Key Metrics to Track:**
• Engagement rate (likes + comments ÷ followers)
• Reach and impressions
• Profile visits and follows
• Save rate (shows content value)

📈 **Optimization Strategies:**
• Post when your audience is most active
• Use analytics to identify top-performing content
• A/B test different caption styles
• Monitor hashtag performance

🚀 **Growth Hacks:**
• Collaborate with other creators
• Engage actively in your community
• Share user-generated content
• Host live sessions or Q&As"""
        
        # Learning and memory
        elif 'learn' in user_input or 'remember' in user_input:
            return "🧠 I can learn! Try: 'learn my niche: fitness' or 'remember posting time: 7 PM'"
        
        # Intelligence upgrade
        elif 'upgrade' in user_input:
            self.intelligence_level += 1
            return f"🚀 Intelligence upgraded to level {self.intelligence_level}! I'm getting smarter about Looply content creation!"
        
        # Help/instructions
        elif any(word in user_input for word in ['help', 'commands', 'what can you do']):
            return """🌟 **I'm LIA, your Looply assistant! Here's what I can help with:**

📝 **Content Creation:**
• "Create a caption about travel"
• "Generate hashtags for fitness"
• "Give me content ideas"

📊 **Growth & Strategy:**
• "Engagement tips"
• "Current trends"
• "Performance advice"

🧠 **Learning:**
• "Learn my niche: photography"
• "Remember my posting time: 8 PM"

💡 **Quick Commands:**
• Ask for jokes, time, or just say hello!
• Be specific about your niche for better suggestions"""
        
        # Default response
        else:
            defaults = [
                "🤔 I'm still learning about that! Try asking for captions, hashtags, content ideas, or engagement tips.",
                "💡 Not sure about that one! I'm great with content creation, hashtags, and Looply growth strategies.",
                "✨ Let me help you with something I know well - try asking for a caption or content ideas!"
            ]
            return random.choice(defaults)

    def upgrade_intelligence(self):
        self.intelligence_level += 1
        return f"🧠 Intelligence upgraded to level {self.intelligence_level}! Now I'm even better at helping with Looply content!"

# Enhanced Interactive UI
def run_interactive():
    print("🌟" + "="*50 + "🌟")
    print("     LOOPLY INTELLIGENT ASSISTANT (LIA)")
    print("        Enhanced Social Media Edition")
    print("🌟" + "="*50 + "🌟")
    print()
    print("✨ Welcome to LIA! I'm your Looply content creation assistant.")
    print("💡 Try: 'create caption', 'suggest hashtags', 'content ideas'")
    print("🚀 Type 'help' for all commands or 'exit' to quit")
    print()
    
    lia = LooplyLIA()
    
    while True:
        try:
            user_input = input("🎭 You: ").strip()
            
            if user_input.lower() in ['exit', 'quit', 'bye']:
                print("\n🌟 Thanks for using LIA! Keep creating amazing content on Looply! ✨")
                break
            
            if not user_input:
                continue
                
            print("🤖 LIA:", lia.chat(user_input))
            print()
            
        except KeyboardInterrupt:
            print("\n\n🌟 Thanks for using LIA! Keep creating amazing content on Looply! ✨")
            break
        except Exception as e:
            print(f"❌ Oops! Something went wrong: {e}")
            print("💡 Try asking for help or content suggestions!")

# Simple HTTP server for frontend integration
def run_server(port=8000):
    import http.server
    import socketserver
    import urllib.parse
    import json
    
    lia = LooplyLIA()
    
    class LIAHandler(http.server.SimpleHTTPRequestHandler):
        def do_POST(self):
            if self.path == '/chat':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                try:
                    data = json.loads(post_data.decode('utf-8'))
                    message = data.get('message', '')
                    
                    response = lia.chat(message)
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    result = {
                        'reply': response,
                        'source': 'looply_lia',
                        'confidence': 0.9,
                        'metadata': {
                            'backend_version': 'clean_final_enhanced',
                            'intelligence_level': lia.intelligence_level
                        }
                    }
                    
                    self.wfile.write(json.dumps(result).encode('utf-8'))
                    
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    error_response = {
                        'reply': f"Sorry, I encountered an error: {str(e)}",
                        'source': 'error',
                        'confidence': 0.0
                    }
                    
                    self.wfile.write(json.dumps(error_response).encode('utf-8'))
        
        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
    
    print(f"🚀 LIA Server running on http://localhost:{port}")
    print("💡 Frontend can now connect to this backend!")
    print("🌟 Press Ctrl+C to stop the server")
    
    with socketserver.TCPServer(("", port), LIAHandler) as httpd:
        httpd.serve_forever()

# Main execution
if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == 'server':
            port = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
            run_server(port)
        elif sys.argv[1] == 'test':
            # Test mode for quick verification
            lia = LooplyLIA()
            test_queries = [
                "hello",
                "create a caption about travel",
                "suggest hashtags for fitness",
                "give me content ideas",
                "engagement tips",
                "current trends"
            ]
            
            print("🧪 Testing LIA functionality...")
            for query in test_queries:
                print(f"\n🎭 Test: {query}")
                print(f"🤖 LIA: {lia.chat(query)}")
                print("-" * 50)
        else:
            print("Usage: python lia_clean_final.py [server|test] [port]")
            print("       python lia_clean_final.py         # Interactive mode")
    else:
        run_interactive()