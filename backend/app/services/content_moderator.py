class ContentModerator:
    async def check_prompt(self, prompt: str) -> bool:
        # TODO: Implement actual content moderation
        # This is a placeholder that just checks for basic profanity
        blocked_words = {"nsfw", "explicit", "violence"}
        return not any(word in prompt.lower() for word in blocked_words) 