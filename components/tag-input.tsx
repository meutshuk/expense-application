'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tags } from '@prisma/client';

interface Tag {
    // id: string
    name: string;
}

interface TagInputProps {
    availableTags: Tag[];
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    // onNewTag: (tag: string) => void;
}

export function TagInput({ availableTags, selectedTags, onTagsChange }: TagInputProps) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log(availableTags)
    }, [availableTags])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input) {
            e.preventDefault();
            addTag(input);
        }
    };

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag) {

            availableTags.push({ name: trimmedTag })
            toggleTag(trimmedTag);
        }
        setInput('');
    };

    const toggleTag = (tag: string) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        onTagsChange(newSelectedTags);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                    <Badge
                        key={tag.name}
                        variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                        className={`cursor-pointer ${selectedTags.includes(tag.name) ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => toggleTag(tag.name)}
                    >
                        {tag.name}
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Add new tag..."
                    className="flex-grow"
                />
                <Button onClick={() => addTag(input)} disabled={!input}>
                    Add
                </Button>
            </div>
        </div>
    );
}

