"use client";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

export default function Calculator() {
    const { calculatorHistory, addCalculatorHistory, clearCalculatorHistory } = useApp();
    const [display, setDisplay] = useState("0");
    const [expression, setExpression] = useState("");
    const [hasCalculated, setHasCalculated] = useState(false);

    const handleNumberClick = (num: string) => {
        if (hasCalculated) {
            setDisplay(num);
            setExpression(num);
            setHasCalculated(false);
        } else {
            if (display === "0") {
                setDisplay(num);
                setExpression(num);
            } else {
                setDisplay(display + num);
                setExpression(expression + num);
            }
        }
    };

    const handleOperatorClick = (operator: string) => {
        setHasCalculated(false);

        // If the last character is an operator, replace it
        if (["+", "-", "*", "/"].includes(expression.slice(-1))) {
            setExpression(expression.slice(0, -1) + operator);
        } else {
            setExpression(expression + operator);
        }
        setDisplay(operator);
    };

    const handleDecimalClick = () => {
        // Check if the current number already has a decimal
        const parts = expression.split(/[-+*/]/);
        const currentPart = parts[parts.length - 1];

        if (!currentPart.includes(".")) {
            setExpression(expression + ".");
            setDisplay(display === "0" || ["+", "-", "*", "/"].includes(display) ? "0." : display + ".");
        }
    };

    const handleClearClick = () => {
        setDisplay("0");
        setExpression("");
        setHasCalculated(false);
    };

    const handleEqualsClick = () => {
        try {
            // Using Function constructor instead of eval for safer evaluation
            // eslint-disable-next-line no-new-func
            const result = Function('"use strict"; return (' + expression + ')')().toString();
            setDisplay(result);

            // Add to history
            addCalculatorHistory({
                expression: expression,
                result: result
            });

            setExpression(result);
            setHasCalculated(true);
        } catch {
            setDisplay("Error");
            setHasCalculated(true);
        }
    };

    const handleBackspaceClick = () => {
        if (expression.length > 0) {
            const newExpression = expression.slice(0, -1);
            setExpression(newExpression);

            if (newExpression.length === 0) {
                setDisplay("0");
            } else {
                // Update display based on the last character or operator
                const lastChar = newExpression.slice(-1);
                if (["+", "-", "*", "/"].includes(lastChar)) {
                    setDisplay(lastChar);
                } else {
                    // Get the last number in the expression
                    const parts = newExpression.split(/[-+*/]/);
                    setDisplay(parts[parts.length - 1] || "0");
                }
            }
        } else {
            setDisplay("0");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Calculator</h1>
                <p className="text-muted-foreground">Perform quick calculations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Calculator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Display */}
                        <div className="bg-muted p-4 rounded-md mb-4 text-right text-2xl font-mono h-16 flex items-center justify-end overflow-x-auto">
                            {display}
                        </div>

                        {/* Calculator Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {/* First Row */}
                            <Button variant="outline" onClick={handleClearClick} className="col-span-2">
                                Clear
                            </Button>
                            <Button variant="outline" onClick={handleBackspaceClick}>
                                ←
                            </Button>
                            <Button variant="outline" onClick={() => handleOperatorClick("/")}>
                                ÷
                            </Button>

                            {/* Second Row */}
                            <Button variant="outline" onClick={() => handleNumberClick("7")}>
                                7
                            </Button>
                            <Button variant="outline" onClick={() => handleNumberClick("8")}>
                                8
                            </Button>
                            <Button variant="outline" onClick={() => handleNumberClick("9")}>
                                9
                            </Button>
                            <Button variant="outline" onClick={() => handleOperatorClick("*")}>
                                ×
                            </Button>

                            {/* Third Row */}
                            <Button variant="outline" onClick={() => handleNumberClick("4")}>
                                4
                            </Button>
                            <Button variant="outline" onClick={() => handleNumberClick("5")}>
                                5
                            </Button>
                            <Button variant="outline" onClick={() => handleNumberClick("6")}>
                                6
                            </Button>
                            <Button variant="outline" onClick={() => handleOperatorClick("-")}>
                                -
                            </Button>

                            {/* Fourth Row */}
                            <Button variant="outline" onClick={() => handleNumberClick("1")}>
                                1
                            </Button>
                            <Button variant="outline" onClick={() => handleNumberClick("2")}>
                                2
                            </Button>
                            <Button variant="outline" onClick={() => handleNumberClick("3")}>
                                3
                            </Button>
                            <Button variant="outline" onClick={() => handleOperatorClick("+")}>
                                +
                            </Button>

                            {/* Fifth Row */}
                            <Button variant="outline" onClick={() => handleNumberClick("0")} className="col-span-2">
                                0
                            </Button>
                            <Button variant="outline" onClick={handleDecimalClick}>
                                .
                            </Button>
                            <Button onClick={handleEqualsClick}>
                                =
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>History</CardTitle>
                        <Button variant="ghost" size="sm" onClick={clearCalculatorHistory}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-2">
                                {calculatorHistory.length > 0 ? (
                                    [...calculatorHistory].reverse().map((item) => (
                                        <div key={item.id} className="p-2 border rounded-md">
                                            <div className="text-sm text-muted-foreground">{item.expression}</div>
                                            <div className="text-lg font-medium">= {item.result}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground">No calculation history yet</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
