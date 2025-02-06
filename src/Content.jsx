import React, { useState, useEffect, useRef } from "react";
import AceEditor from "react-ace";
import * as fabric from "fabric";

// Import language mode & theme
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";

function Content() {
  const [editorText, setEditorText] = useState("// Start coding here...");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [isDrawing, setIsDrawing] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  // Percentage width for the left panel
  const [leftWidth, setLeftWidth] = useState(50);

  const fabricCanvasRef = useRef(null); // Reference to the Fabric canvas instance
  const canvasDomRef = useRef(null); // Reference to the canvas DOM element
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);

  // For dragging the divider
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartLeftWidth = useRef(0);

  useEffect(() => {
    // Capture console.log output
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      setConsoleLogs((prevLogs) => [...prevLogs, args.join(" ")]);
      originalConsoleLog(...args);
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Initialize Fabric.js Canvas
  useEffect(() => {
    // Get the canvas DOM element and its container's width
    const canvasEl = canvasDomRef.current;
    const containerWidth = canvasEl.parentElement.clientWidth;

    // Create the Fabric.js canvas using the DOM element reference
    const canvas = new fabric.Canvas(canvasEl, {
      backgroundColor: "#1e1e1e",
    });

    // Set Fabric's internal dimensions to match the container
    canvas.setWidth(containerWidth);
    canvas.setHeight(350);

    // Enable drawing mode
    canvas.isDrawingMode = isDrawing;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = selectedColor;
    canvas.freeDrawingBrush.width = 5;

    fabricCanvasRef.current = canvas;
    canvas.renderAll();

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update drawing color dynamically
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.color = selectedColor;
    }
  }, [selectedColor]);

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = !fabricCanvasRef.current.isDrawingMode;
      setIsDrawing(fabricCanvasRef.current.isDrawingMode);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      // Reset the background after clearing
      fabricCanvasRef.current.backgroundColor = "#1e1e1e";
      fabricCanvasRef.current.renderAll();
    }
  };

  // Function to run JavaScript code from Ace Editor
  const executeCode = () => {
    setConsoleLogs([]); // Clear previous logs

    // If language is not JavaScript, return an error message.
    if (selectedLanguage !== "JavaScript") {
      setConsoleLogs((prevLogs) => [
        ...prevLogs,
        "Oops... Server Side Error",
      ]);
      return;
    }

    try {
      new Function(editorText)(); // Execute code if language is JavaScript
    } catch (error) {
      console.error(error);
      setConsoleLogs((prevLogs) => [
        ...prevLogs,
        `Error: ${error.message}`,
      ]);
    }
  };

  // Dragging handlers for the divider
  const handleMouseDown = (e) => {
    draggingRef.current = true;
    dragStartX.current = e.clientX;
    dragStartLeftWidth.current =
      leftPanelRef.current.getBoundingClientRect().width;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartX.current;
    const newLeftWidthPx = dragStartLeftWidth.current + dx;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    let newLeftWidthPercent = (newLeftWidthPx / containerWidth) * 100;
    // Clamp the width between 10% and 90%
    if (newLeftWidthPercent < 10) newLeftWidthPercent = 10;
    if (newLeftWidthPercent > 90) newLeftWidthPercent = 90;
    setLeftWidth(newLeftWidthPercent);
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="bg-white text-black"
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Left Section: Ace Editor and Console */}
      <div
        ref={leftPanelRef}
        className="p-4"
        style={{
          width: `${leftWidth}%`,
          overflowY: "auto",
        }}
      >
        <h2 className="text-xl font-semibold mb-2">Code Editor</h2>
        <AceEditor
          mode="javascript"
          theme="monokai"
          name="ace-editor"
          fontSize={16}
          width="100%"
          height="350px"
          value={editorText}
          onChange={(newText) => setEditorText(newText)}
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            enableLiveAutocompletion: true,
            enableBasicAutocompletion: true,
            enableSnippets: true,
            showPrintMargin: false,
            tabSize: 2,
          }}
          className="border border-gray-600 rounded-lg"
        />

        {/* Row with Run Code Button and Language Dropdown */}
        <div className="flex items-center space-x-4 mt-4">
          <button
            onClick={executeCode}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
          >
            Run Code
          </button>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2 py-2 border border-gray-400 rounded"
          >
            <option value="JavaScript">JavaScript</option>
            <option value="C++">C++</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C#">C#</option>
          </select>
        </div>

        {/* Console Output */}
        <div className="mt-4 p-3 border border-gray-500 rounded bg-gray-200 w-full h-40 overflow-y-auto">
          <p className="text-green-700">Console Output:</p>
          {consoleLogs.length === 0 ? (
            <p className="text-gray-600 italic">No output yet...</p>
          ) : (
            consoleLogs.map((log, index) => (
              <p key={index} className="text-gray-800">
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Draggable Divider */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: "5px",
          cursor: "col-resize",
          background: "#ccc",
        }}
      />

      {/* Right Section: Fabric.js Canvas and Controls */}
      <div
        className="p-4 flex flex-col items-center"
        style={{
          width: `${100 - leftWidth}%`,
          overflowY: "auto",
        }}
      >
        <h2 className="text-xl font-semibold mb-2">Drawing Canvas</h2>
        <canvas
          id="fabric-canvas"
          ref={canvasDomRef}
          className="border border-gray-600 rounded-lg"
          style={{ width: "100%", height: "350px" }}
        ></canvas>

        {/* Buttons for Drawing Controls */}
        <div className="mt-4 flex space-x-4">
          <button
            onClick={toggleDrawingMode}
            className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-all"
          >
            {isDrawing ? "Stop Drawing" : "Start Drawing"}
          </button>
          <button
            onClick={clearCanvas}
            className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all"
          >
            Clear Canvas
          </button>
        </div>

        {/* Smaller Color Picker Buttons */}
        <div className="mt-4 flex space-x-4">
          {[
            "#ff0000",
            "#00ff00",
            "#0000ff",
            "#ffff00",
            "#ff00ff",
            "#00ffff",
          ].map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColor === color ? "border-black scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Content;
