import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DContexts } from "../contexts/DContexts";

/**
 * Renders a string with simple Markdown support:
 *   **bold**, _italic_, • bullet points, --- dividers
 */
export default function MarkdownRenderer({ content, style = {} }) {
    const { txtcolor } = useContext(DContexts);

    if (!content) return null;

    const lines = content.split("\n");

    const renderLine = (line, index) => {
        // Horizontal rule
        if (line.trim() === "---") {
            return (
                <View
                    key={index}
                    style={[styles.divider, { borderBottomColor: "grey" }]}
                />
            );
        }

        // Bullet point
        const isBullet = line.startsWith("• ");
        const textContent = isBullet ? line.slice(2) : line;

        return (
            <View
                key={index}
                style={[styles.lineContainer, isBullet && styles.bulletLine]}
            >
                {isBullet && (
                    <Text style={[styles.bulletDot, { color: txtcolor }]}>•</Text>
                )}
                <Text
                    style={[styles.lineText, { color: txtcolor }, style]}
                >
                    {renderInlineMarkdown(textContent, txtcolor)}
                </Text>
            </View>
        );
    };

    return <View>{lines.map((line, i) => renderLine(line, i))}</View>;
}

function renderInlineMarkdown(text, txtcolor) {
    // Tokenize: **bold** and _italic_
    const parts = [];
    const regex = /(\*\*[\s\S]*?\*\*|_[\s\S]*?_)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const matchStr = match[0];
        const start = match.index;

        // Add plain text before the match
        if (start > lastIndex) {
            parts.push({ type: "plain", text: text.slice(lastIndex, start) });
        }

        if (matchStr.startsWith("**")) {
            parts.push({ type: "bold", text: matchStr.slice(2, -2) });
        } else if (matchStr.startsWith("_")) {
            parts.push({ type: "italic", text: matchStr.slice(1, -1) });
        }

        lastIndex = start + matchStr.length;
    }

    // Remaining plain text
    if (lastIndex < text.length) {
        parts.push({ type: "plain", text: text.slice(lastIndex) });
    }

    if (parts.length === 0) {
        return <Text style={{ color: txtcolor }}>{text}</Text>;
    }

    return parts.map((part, i) => {
        if (part.type === "bold") {
            return (
                <Text key={i} style={{ fontWeight: "bold", color: txtcolor }}>
                    {part.text}
                </Text>
            );
        } else if (part.type === "italic") {
            return (
                <Text key={i} style={{ fontStyle: "italic", color: txtcolor }}>
                    {part.text}
                </Text>
            );
        }
        return (
            <Text key={i} style={{ color: txtcolor }}>
                {part.text}
            </Text>
        );
    });
}

const styles = StyleSheet.create({
    lineContainer: {
        flexDirection: "row",
        marginBottom: 2,
        flexWrap: "wrap",
    },
    bulletLine: {
        alignItems: "flex-start",
        paddingLeft: 4,
    },
    bulletDot: {
        marginRight: 6,
        fontSize: 16,
        lineHeight: 22,
    },
    lineText: {
        fontSize: 16,
        lineHeight: 24,
        flex: 1,
        flexWrap: "wrap",
    },
    divider: {
        borderBottomWidth: 1,
        marginVertical: 8,
    },
});
