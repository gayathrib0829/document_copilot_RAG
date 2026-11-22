from app.services.llm import groq_client, MODEL_NAME

response = groq_client.chat.completions.create(
    model=MODEL_NAME,
    messages=[
        {
            "role": "user",
            "content": "Explain what a PDF document is in two sentences."
        }
    ],
    max_completion_tokens=200
)

print("Groq connection successful!")
print("\nAI Response:")
print(response.choices[0].message.content)