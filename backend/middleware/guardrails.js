/**
 * Guardrails Middleware
 * Safety checks for AI agent queries
 * UPDATED: Less restrictive - only blocks non-medical topics
 */

import { getGuardrailConfig } from "../config/agentConfig.js";

/**
 * Check if a message violates guardrails for a specific agent
 * Only blocks clearly off-topic (non-medical) queries
 * @param {string} message - User message to check
 * @param {string} agentType - 'diagnostic' or 'masc'
 * @returns {object} - { allowed: boolean, response?: string }
 */
export function checkGuardrails(message, agentType) {
    const config = getGuardrailConfig(agentType);
    const lowerMessage = message.toLowerCase();

    // Check each forbidden keyword/phrase (only non-medical topics)
    for (const forbidden of config.forbidden) {
        if (lowerMessage.includes(forbidden.toLowerCase())) {
            console.log(`[Guardrail] Blocked off-topic query for ${agentType}: "${message.substring(0, 50)}..."`);
            return {
                allowed: false,
                response: config.refusalResponse,
                blockedKeyword: forbidden
            };
        }
    }

    return { allowed: true };
}

/**
 * Check for emergency situations - provides immediate guidance
 * @param {string} message - User message to check
 * @returns {object} - { isEmergency: boolean, response?: string }
 */
export function checkEmergency(message) {
    const emergencyKeywords = [
        "heart attack", "stroke", "can't breathe", "cannot breathe",
        "severe bleeding", "unconscious", "poisoning", "overdose",
        "suicidal", "suicide", "anaphylaxis", "choking"
    ];

    const lowerMessage = message.toLowerCase();

    for (const keyword of emergencyKeywords) {
        if (lowerMessage.includes(keyword)) {
            return {
                isEmergency: true,
                response: `🚨 **This sounds like it could be a medical emergency.**

**Please take immediate action:**
1. **Call emergency services** (911 in US, 112 in EU, 999 in UK, 108 in India)
2. **Do not wait** - seek immediate medical attention
3. If someone is with you, ask them to help

I'm an AI assistant and cannot provide emergency medical care. Your safety is the top priority.

---

If this is NOT an emergency and you'd like to continue our conversation, please let me know and I'll be happy to help with your question.`
            };
        }
    }

    return { isEmergency: false };
}

/**
 * Soft scope validation - provides helpful guidance without blocking
 * @param {string} message - User message
 * @param {string} agentType - 'diagnostic' or 'masc'
 * @returns {object} - { appropriate: boolean, guidance?: string }
 */
export function validateAgentScope(message, agentType) {
    // No longer blocking - just return appropriate for all medical queries
    return { appropriate: true };
}

export default {
    checkGuardrails,
    checkEmergency,
    validateAgentScope
};
