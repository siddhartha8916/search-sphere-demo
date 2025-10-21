#!/usr/bin/env python3
"""
Test script for Hybrid Search API
This script tests the upload and search functionality
"""

import requests
import os
import tempfile
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test if the API is running"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ API is healthy")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        return False

def test_upload():
    """Test file upload"""
    # Create a temporary test file
    test_content = """
    This is a test document about machine learning and artificial intelligence.
    Machine learning is a subset of AI that focuses on algorithms that can learn from data.
    Vector databases are crucial for storing embeddings used in semantic search.
    Hybrid search combines traditional keyword search with vector similarity search.
    """
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(test_content)
        temp_file_path = f.name
    
    try:
        with open(temp_file_path, 'rb') as f:
            files = {'file': ('test_document.txt', f, 'text/plain')}
            response = requests.post(f"{BASE_URL}/hybrid-search/upload", files=files)
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ File uploaded successfully: {data['filename']}")
            print(f"   File ID: {data['file_id']}")
            return data['file_id']
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return None
    finally:
        os.unlink(temp_file_path)

def test_search(query, mode="hybrid"):
    """Test search functionality"""
    try:
        params = {'q': query, 'mode': mode}
        response = requests.get(f"{BASE_URL}/hybrid-search/search", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search successful ({mode} mode)")
            print(f"   Query: {data['query']}")
            print(f"   Results: {data['total_results']}")
            
            for i, result in enumerate(data['results'][:2], 1):
                print(f"   Result {i}:")
                print(f"     - Title: {result['title']}")
                print(f"     - Hybrid Score: {result['scores']['hybrid']:.3f}")
                print(f"     - Snippet: {result['snippet'][:100]}...")
            
            return True
        else:
            print(f"❌ Search failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Search error: {e}")
        return False

def test_list_attachments():
    """Test listing attachments"""
    try:
        response = requests.get(f"{BASE_URL}/hybrid-search/attachments")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Listed attachments: {data['total']} files")
            for attachment in data['attachments'][:3]:
                print(f"   - {attachment['filename']} (ID: {attachment['id']})")
            return True
        else:
            print(f"❌ List attachments failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ List attachments error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Hybrid Search API")
    print("=" * 50)
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Cannot proceed - API is not running")
        return
    
    print()
    
    # Test 2: Upload file
    file_id = test_upload()
    if not file_id:
        print("\n❌ Cannot proceed - file upload failed")
        return
    
    print()
    
    # Test 3: List attachments
    test_list_attachments()
    
    print()
    
    # Test 4: Search tests
    test_queries = [
        ("machine learning", "hybrid"),
        ("vector databases", "semantic"),
        ("artificial intelligence", "keyword"),
        ("search algorithms", "hybrid")
    ]
    
    for query, mode in test_queries:
        test_search(query, mode)
        print()
    
    print("🎉 All tests completed!")
    print("\n💡 Try opening the API docs at: http://localhost:8000/docs")

if __name__ == "__main__":
    main()