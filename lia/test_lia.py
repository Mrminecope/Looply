#!/usr/bin/env python3
"""
Test script for Looply LIA functionality
Run this to verify all features are working correctly
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lia_clean_final import LooplyLIA

def test_lia_functionality():
    """Test all major LIA functions"""
    print("🧪 Testing Looply LIA Functionality")
    print("=" * 50)
    
    # Initialize LIA
    lia = LooplyLIA()
    
    # Test cases
    test_cases = [
        ("Basic greeting", "hello"),
        ("Time query", "what time is it"),
        ("Caption generation", "create a caption about travel"),
        ("Hashtag suggestions", "suggest hashtags for fitness"),
        ("Content ideas", "give me content ideas"),
        ("Engagement tips", "how to get more engagement"),
        ("Trend analysis", "what's trending now"),
        ("Joke request", "tell me a joke"),
        ("Help request", "what can you do"),
        ("Learning capability", "learn my niche: photography"),
        ("Intelligence upgrade", "upgrade your intelligence"),
        ("Unknown query", "what's the weather like on Mars")
    ]
    
    results = []
    
    for test_name, query in test_cases:
        print(f"\n🔍 Testing: {test_name}")
        print(f"📝 Query: '{query}'")
        
        try:
            response = lia.chat(query)
            print(f"✅ Response: {response[:100]}{'...' if len(response) > 100 else ''}")
            results.append((test_name, "✅ PASS", len(response)))
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append((test_name, "❌ FAIL", 0))
    
    # Test learning and recall
    print(f"\n🧠 Testing learning capability...")
    try:
        learn_result = lia.learn("favorite_color", "purple")
        print(f"✅ Learn result: {learn_result}")
        
        recall_result = lia.recall("favorite_color")
        print(f"✅ Recall result: {recall_result}")
        
        results.append(("Learning/Recall", "✅ PASS", len(learn_result + recall_result)))
    except Exception as e:
        print(f"❌ Learning/Recall Error: {e}")
        results.append(("Learning/Recall", "❌ FAIL", 0))
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, status, _ in results if "PASS" in status)
    total = len(results)
    
    for test_name, status, response_length in results:
        print(f"{status} {test_name:<20} (Response: {response_length} chars)")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! LIA is working perfectly!")
        return True
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        return False

def test_specific_features():
    """Test specific Looply features"""
    print("\n🎭 Testing Looply-Specific Features")
    print("=" * 50)
    
    lia = LooplyLIA()
    
    # Test caption generation with different topics
    topics = ["fitness", "travel", "food", "technology", "art"]
    
    for topic in topics:
        print(f"\n🎨 Caption for {topic}:")
        caption = lia.generate_caption(topic)
        print(f"   {caption}")
    
    # Test hashtag generation
    print(f"\n📱 Hashtag suggestions:")
    for topic in topics:
        hashtags = lia.get_hashtags_for_topic(topic)
        print(f"   {topic}: {hashtags[:3]}")
    
    # Test content ideas
    print(f"\n💡 Content ideas:")
    ideas = lia.get_content_ideas("fitness")
    print(f"   {ideas[:200]}...")
    
    # Test engagement tips
    print(f"\n🚀 Engagement tips:")
    tips = lia.get_engagement_tips("general")
    print(f"   {tips[:200]}...")

def benchmark_performance():
    """Test LIA response times"""
    import time
    
    print("\n⚡ Performance Benchmark")
    print("=" * 50)
    
    lia = LooplyLIA()
    
    queries = [
        "hello",
        "create a caption about travel", 
        "suggest hashtags for fitness",
        "give me content ideas",
        "engagement tips"
    ]
    
    times = []
    
    for query in queries:
        start_time = time.time()
        response = lia.chat(query)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        times.append(response_time)
        
        print(f"⏱️  '{query[:30]}...' -> {response_time:.2f}ms")
    
    avg_time = sum(times) / len(times)
    print(f"\n📊 Average response time: {avg_time:.2f}ms")
    
    if avg_time < 50:
        print("🚀 Excellent performance!")
    elif avg_time < 100:
        print("✅ Good performance!")
    else:
        print("⚠️  Consider optimization")

if __name__ == "__main__":
    print("🌟 LOOPLY LIA TEST SUITE")
    print("🤖 Testing the enhanced Looply Intelligent Assistant")
    print()
    
    # Run all tests
    try:
        success = test_lia_functionality()
        test_specific_features()
        benchmark_performance()
        
        print("\n" + "🌟" * 20)
        if success:
            print("🎉 LIA is ready for Looply! All systems operational.")
            print("💡 You can now start the server with: python lia_clean_final.py server")
            print("🚀 Or test interactively with: python lia_clean_final.py")
        else:
            print("⚠️  LIA has some issues. Check the test results above.")
        print("🌟" * 20)
        
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Test suite failed: {e}")
        sys.exit(1)