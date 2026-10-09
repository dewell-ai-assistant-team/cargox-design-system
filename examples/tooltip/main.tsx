import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Tooltip, TooltipContent, type CxTooltipArrowPosition } from "../../src";
import "./preview.css";

const positions: CxTooltipArrowPosition[] = [
  "above-start", "above-center", "above-end",
  "after-top", "after-center", "after-bottom",
  "before-top", "before-center", "before-bottom",
  "below-start", "below-center", "below-end", "none",
];

function App() {
  const [mounted, setMounted] = useState(true);
  const [open, setOpen] = useState(false);
  return (
    <main className="cx-theme">
      <h1>Tooltip</h1>
      <p>Hover or focus the buttons. Escape dismisses the tooltip.</p>
      <div className="actions">
        {mounted && <Tooltip content="识别当前文档中的内容" delay={100}><Button id="vision" aria-describedby="existing-description" ref={(node) => { if (node) node.dataset.ref = "attached"; }} onClick={(event) => { event.currentTarget.dataset.clicked = "true"; }}>AI Vision</Button></Tooltip>}
        <Tooltip content="Disabled tooltip" disabled open><Button id="disabled">Disabled tooltip</Button></Tooltip>
        <Tooltip content="Long description with an unbroken word: abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz" theme="light"><Button id="long">Long content</Button></Tooltip>
        <Tooltip content="Controlled tooltip" open={open} onOpenChange={setOpen}><Button id="controlled">Controlled</Button></Tooltip>
        <Button id="toggle" onClick={() => setMounted((value) => !value)}>Mount/unmount</Button>
        <Tooltip content="Explain disabled action" delay={0}><Button id="disabled-action" disabled aria-describedby="existing-description">Disabled action</Button></Tooltip>
      </div>
      <span id="existing-description" hidden>Existing description retained.</span>
      <div className="clipped">
        <Tooltip content="Visible outside overflow hidden" delay={0}><Button id="clipped">Clipped parent</Button></Tooltip>
      </div>
      <Tooltip content="Flip below at top edge" placement="top" delay={0}><Button id="edge" className="edge">Edge</Button></Tooltip>
      {(["light", "dark"] as const).map((theme) => (
        <section key={theme}>
          <h2>{theme}</h2>
          <div className="gallery">
            {positions.map((position) => (
              <div className="slot" key={position}>
                <TooltipContent theme={theme} arrowPosition={position}>
                  {position + "\nMax width is reached at 240px."}
                </TooltipContent>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
