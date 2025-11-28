import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

interface Question {
    id: string;
    question: string;
    type: string;
    options: Array<{ value: string; label: string }>;
}

interface PersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    onSave: () => void;
}

export function PersonalizationModal({
    isOpen,
    onClose,
    sessionId,
    onSave,
}: PersonalizationModalProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchQuestions();
            fetchExistingPreferences();
        }
    }, [isOpen, sessionId]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/preferences/questions`);
            const data = await response.json();
            setQuestions(data.questions);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingPreferences = async () => {
        if (!sessionId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/preferences/${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setAnswers(data);
            }
        } catch (error) {
            // No existing preferences
        }
    };

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleMultiSelectChange = (questionId: string, optionValue: string, checked: boolean) => {
        setAnswers((prev) => {
            const currentValues = prev[questionId] || [];
            if (checked) {
                return {
                    ...prev,
                    [questionId]: [...currentValues, optionValue],
                };
            } else {
                return {
                    ...prev,
                    [questionId]: currentValues.filter((v: string) => v !== optionValue),
                };
            }
        });
    };

    const handleSave = async () => {
        if (!sessionId) return;

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/preferences/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    ...answers,
                }),
            });

            if (response.ok) {
                onSave();
            }
        } catch (error) {
            console.error("Error saving preferences:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-2xl font-bold">
                        Personalize Your Experience
                    </DialogTitle>
                    <DialogDescription>
                        Answer these questions to get personalized investment recommendations
                        tailored to your goals and preferences.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="px-6 max-h-[50vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            {questions.map((question, index) => (
                                <div key={question.id} className="space-y-3">
                                    <Label className="text-base font-medium">
                                        {index + 1}. {question.question}
                                    </Label>

                                    {question.type === "select" && (
                                        <Select
                                            value={answers[question.id] || ""}
                                            onValueChange={(value) =>
                                                handleAnswerChange(question.id, value)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {question.options.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {question.type === "multi-select" && (
                                        <div className="space-y-2 pl-2">
                                            {question.options.map((option) => (
                                                <div
                                                    key={option.value}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`${question.id}-${option.value}`}
                                                        checked={
                                                            (answers[question.id] || []).includes(
                                                                option.value
                                                            )
                                                        }
                                                        onCheckedChange={(checked) =>
                                                            handleMultiSelectChange(
                                                                question.id,
                                                                option.value,
                                                                checked as boolean
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={`${question.id}-${option.value}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="px-6 pb-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Preferences"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
