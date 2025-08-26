'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Lightbulb, Calculator, Beaker, Waypoints } from 'lucide-react';

const AIScientistPage = () => {
    const [generationMode, setGenerationMode] = useState('scrape');
    const [currentHypothesis, setCurrentHypothesis] = useState('');
    const [currentEquation, setCurrentEquation] = useState<{name: string, formula: string} | null>(null);
    const [suggestedExperiments, setSuggestedExperiments] = useState<any[]>([]);
    const [currentDomain, setCurrentDomain] = useState('');
    
    const [arxivKeyword, setArxivKeyword] = useState('');
    const [userHypothesis, setUserHypothesis] = useState('');

    const [hypothesisOutput, setHypothesisOutput] = useState('');
    const [regressionOutput, setRegressionOutput] = useState('');
    const [experimentOutput, setExperimentOutput] = useState('');
    const [graphOutput, setGraphOutput] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [isRegressing, setIsRegressing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isUpdatingGraph, setIsUpdatingGraph] = useState(false);

    const [step2Enabled, setStep2Enabled] = useState(false);
    const [step3Enabled, setStep3Enabled] = useState(false);
    const [step4Enabled, setStep4Enabled] = useState(false);

    const graphRef = useRef<SVGSVGElement>(null);
    const nodes = useRef([
        { id: "Physics", group: 1, size: 20 }, { id: "Classical Mechanics", group: 2, size: 15 },
        { id: "Electromagnetism", group: 2, size: 15 }, { id: "Thermodynamics", group: 2, size: 15 },
        { id: "Force", group: 3, size: 10 }, { id: "Mass", group: 3, size: 10 }, { id: "Acceleration", group: 3, size: 10 },
    ]);
    const links = useRef([
        { source: "Physics", target: "Classical Mechanics" }, { source: "Physics", target: "Electromagnetism" },
        { source: "Physics", target: "Thermodynamics" }, { source: "Classical Mechanics", target: "Force" },
        { source: "Classical Mechanics", target: "Mass" }, { source: "Classical Mechanics", target: "Acceleration" },
    ]);
    const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);


    useEffect(() => {
        if (!graphRef.current) return;
        
        const width = graphRef.current.parentElement?.clientWidth || 800;
        const height = 384;
        const svg = d3.select(graphRef.current);
        svg.attr("width", width).attr("height", height);

        simulationRef.current = d3.forceSimulation(nodes.current as any)
            .force("link", d3.forceLink(links.current).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2));
        
        updateGraphVisualization();
    }, []);

    const updateGraphVisualization = () => {
        if (!graphRef.current || !simulationRef.current) return;

        const svg = d3.select(graphRef.current);
        svg.selectAll('*').remove();

        const link = svg.append("g").attr("class", "links").selectAll("line").data(links.current).enter().append("line")
            .attr("stroke", "#999").attr("stroke-opacity", 0.6);

        const node = svg.append("g").attr("class", "nodes").selectAll("circle").data(nodes.current).enter().append("circle")
            .attr("r", (d: any) => d.size).attr("fill", (d: any) => d3.schemeCategory10[d.group])
            .attr("stroke", "#fff").attr("stroke-width", "1.5px").style("cursor", "pointer")
            .call(d3.drag<any, any>()
                .on("start", dragstarted)
                .on("end", dragended));

        const labels = svg.append("g").attr("class", "labels").selectAll("text").data(nodes.current).enter().append("text")
            .attr("dx", 12).attr("dy", ".35em").text((d: any) => d.id);
        
        simulationRef.current.nodes(nodes.current as any).on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);
            node
                .attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y);
            labels
                .attr("x", (d: any) => d.x + d.size)
                .attr("y", (d: any) => d.y);
        });

        (simulationRef.current.force("link") as d3.ForceLink<any, any>).links(links.current);
        simulationRef.current.alpha(1).restart();

        function dragstarted(event: any, d: any) { if (!event.active) (simulationRef.current as any).alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
        function dragged(event: any, d: any) { d.fx = event.x; d.fy = event.y; }
        function dragended(event: any, d: any) { if (!event.active) (simulationRef.current as any).alphaTarget(0); d.fx = null; d.fy = null; }
    };
    
    const typeWriter = (setter: (text: string) => void, text: string, callback?: () => void) => {
        let i = 0;
        setter("");
        const interval = setInterval(() => {
            if (i < text.length) {
                setter(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 20);
    };

    const resetWorkflow = () => {
        setStep2Enabled(false);
        setStep3Enabled(false);
        setStep4Enabled(false);
        setHypothesisOutput('');
        setRegressionOutput('');
        setExperimentOutput('');
        setGraphOutput('');
        setCurrentHypothesis('');
        setCurrentEquation(null);
        setSuggestedExperiments([]);
        setCurrentDomain('');
    };

    const handleGenerateHypothesis = () => {
        resetWorkflow();
        setIsGenerating(true);

        const scrapedHypotheses: { [key: string]: string } = {
            'dark matter': "What if dark matter interacts with ordinary matter via a novel fifth force, affecting galactic rotation curves?",
            'quantum entanglement': "Can the principles of quantum entanglement be explained by a sub-quantum, deterministic mechanism?",
            'black hole': "Does the information paradox imply a breakdown of quantum mechanics, or is information stored on the event horizon in a novel way?",
            'default': "What is the fundamental relationship between force, mass, and acceleration?"
        };

        let hypothesisText = '';
        let initialMessage = '';

        if (generationMode === 'scrape') {
            const keyword = arxivKeyword.toLowerCase() || 'default';
            hypothesisText = scrapedHypotheses[keyword] || scrapedHypotheses['default'];
            setCurrentHypothesis(hypothesisText);
            initialMessage = `> Simulating arXiv scrape for "${keyword}"...\n\n> Hypothesis Found:\n> ${hypothesisText}`;
        } else {
            hypothesisText = userHypothesis;
            if (!hypothesisText) {
                setHypothesisOutput("> Please enter a hypothesis.");
                setIsGenerating(false);
                return;
            }
            setCurrentHypothesis(hypothesisText);
            initialMessage = `> Processing user hypothesis:\n> ${hypothesisText}`;
        }
        
        setTimeout(() => {
            typeWriter(setHypothesisOutput, initialMessage, () => {
                setTimeout(() => {
                    const domains = ['classical_mechanics', 'electromagnetism', 'thermodynamics'];
                    const determinedDomain = domains[Math.floor(Math.random() * domains.length)];
                    setCurrentDomain(determinedDomain);
                    const domainName = determinedDomain.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const analysisText = `\n\n> Analyzing hypothesis...\n> Core concepts align with ${domainName}.\n> Subsequent steps will proceed in this domain.`;
                    
                    typeWriter(newVal => setHypothesisOutput(initialMessage + newVal), analysisText, () => {
                        setIsGenerating(false);
                        setStep2Enabled(true);
                    });
                }, 1500);
            });
        }, 1500);
    };

    const handleRunRegression = () => {
        setIsRegressing(true);
        const equations: { [key: string]: { name: string, formula: string } } = {
            classical_mechanics: { name: "Newton's Second Law", formula: "F = m * a" },
            electromagnetism: { name: "Coulomb's Law", formula: "F = k * (q1 * q2) / r^2" },
            thermodynamics: { name: "Ideal Gas Law", formula: "PV = nRT" }
        };

        setTimeout(() => {
            const eq = equations[currentDomain];
            setCurrentEquation(eq);
            typeWriter(setRegressionOutput, `> Equation Discovered:\n> ${eq.name}\n> ${eq.formula}`, () => {
                setIsRegressing(false);
                setStep3Enabled(true);
            });
        }, 2000);
    };

    const handleSuggestExperiments = () => {
        setIsSuggesting(true);
        const experiments = [
            { name: "Experiment 1", description: "Vary mass while keeping force constant and measure acceleration." },
            { name: "Experiment 2", description: "Vary force while keeping mass constant and measure acceleration." },
        ];

        setTimeout(() => {
            setSuggestedExperiments(experiments);
            const resultText = experiments.map(e => `* ${e.name}:\n  ${e.description}`).join('\n');
            typeWriter(setExperimentOutput, `> Suggested Experiments:\n${resultText}`, () => {
                setIsSuggesting(false);
                setStep4Enabled(true);
            });
        }, 2500);
    };

    const handleUpdateGraph = () => {
        setIsUpdatingGraph(true);
        const newLaw = currentEquation?.name;
        if (newLaw && !nodes.current.find(n => n.id === newLaw)) {
            const domainName = currentDomain.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            nodes.current.push({ id: newLaw, group: 4, size: 12 });
            links.current.push({ source: domainName, target: newLaw } as any);
            if (currentDomain === 'classical_mechanics') {
                links.current.push({ source: newLaw, target: "Force" } as any, { source: newLaw, target: "Mass" } as any, { source: newLaw, target: "Acceleration" } as any);
            }
            updateGraphVisualization();
        }
        setTimeout(() => {
            typeWriter(setGraphOutput, `> Knowledge graph updated.\n> '${newLaw}' integrated as a validated physical law.`);
            setIsUpdatingGraph(false);
        }, 1500);
    };

    const renderOutputBox = (content: string, isLoading: boolean) => (
        <div className="output-box mt-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-full"><div className="loading-spinner"></div></div>
            ) : (
                <pre className="whitespace-pre-wrap break-words">{content}</pre>
            )}
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
             <style jsx global>{`
                .step-card {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }
                .step-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.1);
                }
                .step-header {
                    border-bottom: 1px solid #e5e7eb;
                }
                .step-number {
                    background-color: #3b82f6;
                    color: white;
                    border-radius: 9999px;
                    width: 2.5rem;
                    height: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }
                .btn {
                    transition: all 0.2s ease;
                }
                .btn:hover {
                    transform: scale(1.05);
                }
                .output-box {
                    background-color: #1f2937;
                    color: #d1d5db;
                    font-family: 'Courier New', Courier, monospace;
                    border-radius: 8px;
                    padding: 1rem;
                    min-height: 8rem;
                    flex-grow: 1;
                    overflow-wrap: break-word;
                    display: flex;
                    flex-direction: column;
                }
                .knowledge-graph-container {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background-color: #fafafa;
                }
                .loading-spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .tab-btn {
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s;
                }
                .tab-btn.active {
                    color: #3b82f6;
                    border-bottom-color: #3b82f6;
                    font-weight: 600;
                }
            `}</style>
            <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">AI Scientist: Interactive Simulation</h1>
                    <p className="mt-4 text-lg text-gray-600">A demonstration of the workflow described in "Toward an AI-Assisted Scientist".</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Step 1 */}
                    <div className="step-card p-6">
                        <div className="step-header flex items-center pb-4 mb-4">
                            <div className="step-number">1</div>
                            <h2 className="text-xl font-bold ml-4">Hypothesis Generation</h2>
                        </div>
                        <div className="flex border-b mb-4">
                            <button onClick={() => setGenerationMode('scrape')} className={`tab-btn ${generationMode === 'scrape' ? 'active' : ''}`}>Scrape arXiv</button>
                            <button onClick={() => setGenerationMode('input')} className={`tab-btn ${generationMode === 'input' ? 'active' : ''}`}>User Input</button>
                        </div>
                        {generationMode === 'scrape' ? (
                            <div>
                                <p className="text-gray-600 mb-2 text-sm">Enter a keyword to simulate scraping arXiv for a research question.</p>
                                <input value={arxivKeyword} onChange={e => setArxivKeyword(e.target.value)} type="text" placeholder="e.g., dark matter" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600 mb-2 text-sm">Enter your own hypothesis or research question below.</p>
                                <textarea value={userHypothesis} onChange={e => setUserHypothesis(e.target.value)} placeholder="e.g., What if gravity is a quantized force?" className="w-full p-2 border border-gray-300 rounded-md text-sm" rows={3}></textarea>
                            </div>
                        )}
                        <button onClick={handleGenerateHypothesis} disabled={isGenerating} className="mt-4 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md btn hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2">
                            <Lightbulb size={18} />Generate Hypothesis
                        </button>
                        {renderOutputBox(hypothesisOutput, isGenerating)}
                    </div>
                    
                    {/* Step 2 */}
                    <div className={`step-card p-6 ${!step2Enabled && 'opacity-50'}`}>
                         <div className="step-header flex items-center pb-4 mb-4">
                            <div className="step-number">2</div>
                            <h2 className="text-xl font-bold ml-4">Symbolic Regression</h2>
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">The AI fits the hypothesis to experimental data to derive a candidate mathematical equation.</p>
                         <button onClick={handleRunRegression} disabled={!step2Enabled || isRegressing} className="mt-auto w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md btn hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2">
                            <Calculator size={18} />Discover Equation
                        </button>
                        {renderOutputBox(regressionOutput, isRegressing)}
                    </div>

                    {/* Step 3 */}
                    <div className={`step-card p-6 ${!step3Enabled && 'opacity-50'}`}>
                         <div className="step-header flex items-center pb-4 mb-4">
                            <div className="step-number">3</div>
                            <h2 className="text-xl font-bold ml-4">Suggest Experiments</h2>
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">The AI proposes experiments to validate the newly discovered equation.</p>
                         <button onClick={handleSuggestExperiments} disabled={!step3Enabled || isSuggesting} className="mt-auto w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md btn hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2">
                            <Beaker size={18} />Suggest Experiments
                        </button>
                        {renderOutputBox(experimentOutput, isSuggesting)}
                    </div>

                    {/* Step 4 */}
                    <div className={`step-card p-6 ${!step4Enabled && 'opacity-50'}`}>
                         <div className="step-header flex items-center pb-4 mb-4">
                            <div className="step-number">4</div>
                            <h2 className="text-xl font-bold ml-4">Knowledge Graph Update</h2>
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">A validated law is integrated into the AI's core knowledge, refining future hypotheses.</p>
                         <button onClick={handleUpdateGraph} disabled={!step4Enabled || isUpdatingGraph} className="mt-auto w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md btn hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2">
                            <Waypoints size={18} />Update Knowledge
                        </button>
                        {renderOutputBox(graphOutput, isUpdatingGraph)}
                    </div>
                </div>

                <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-center mb-4">Live Knowledge Graph</h3>
                    <div className="knowledge-graph-container w-full h-96">
                        <svg ref={graphRef}></svg>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AIScientistPage;
