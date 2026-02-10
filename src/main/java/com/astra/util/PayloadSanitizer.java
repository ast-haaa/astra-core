package com.astra.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Improved sanitizer: tries to parse raw payload as JSON; if that fails,
 * it quotes keys and then programmatically quotes any unquoted value that
 * is NOT a number, boolean, or null. This handles ISO timestamps like
 * 2025-10-10T15:00:00Z correctly.
 */
public class PayloadSanitizer {
    private static final ObjectMapper mapper = new ObjectMapper();

    // matches an unquoted value after a colon up to a comma or closing brace/bracket
    private static final Pattern UNQUOTED_VALUE = Pattern.compile(":\\s*([^\\{\\\"\\[,\\]\\}]+)(?=[,\\}])");
    // simple number pattern (integer or decimal, optional leading -)
    private static final Pattern NUMBER = Pattern.compile("^-?\\d+(?:\\.\\d+)?$");
    // boolean or null
    private static final Pattern BOOL_NULL = Pattern.compile("^(?:true|false|null)$", Pattern.CASE_INSENSITIVE);

    public static String ensureValidJson(String raw) throws JsonProcessingException {
        if (raw == null) throw new JsonProcessingException("null payload"){};
        String trimmed = raw.trim();

        // 1) First try: maybe it's already valid JSON
        try {
            Object obj = mapper.readValue(trimmed, Object.class);
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            // proceed to attempt fixing
        }

        // 2) Quote keys like {boxId:  -> {"boxId":
        String step = trimmed.replaceAll("(?<=\\{|,)(\\s*)([A-Za-z0-9_\\-]+)(\\s*):", "$1\"$2\":");

        // 3) Find unquoted values and decide whether to quote them.
        Matcher m = UNQUOTED_VALUE.matcher(step);
        StringBuffer sb = new StringBuffer();
        while (m.find()) {
            String value = m.group(1).trim();
            String replacement;
            // if it's a number literal (e.g., 27.5) -> leave as-is
            if (NUMBER.matcher(value).matches() || BOOL_NULL.matcher(value).matches()) {
                replacement = ":" + value;
            } else {
                // otherwise quote and escape any existing quotes/backslashes just in case
                String escaped = value.replace("\\", "\\\\").replace("\"", "\\\"");
                replacement = ":\"" + escaped + "\"";
            }
            // append replacement (note: replace group 0 which includes preceding colon)
            m.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        m.appendTail(sb);

        // 4) Collapse extraneous whitespace (optional)
        String cleaned = sb.toString().replaceAll("\\s+", "");

        // 5) Validate by parsing with Jackson
        Object obj = mapper.readValue(cleaned, Object.class);
        return mapper.writeValueAsString(obj);
    }
}
