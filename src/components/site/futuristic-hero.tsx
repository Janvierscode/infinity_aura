import Image from "next/image";
import { Sparkles } from "lucide-react";

export function FuturisticHero() {
  return (
    <div className="futuristic-hero" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="hero-logo"><div /><Image src="/brand/infinity-aura-icon.jpg" alt="" width={640} height={640} priority /></div>
      <div className="floating-pill pill-one"><Sparkles size={17} /> Curated opportunity</div>
      <div className="floating-pill pill-two"><span /> Community active</div>
      <div className="code-window">
        <div><i /><i /><i /><small>build.ts</small></div>
        <code><b>const</b> opportunity = <em>await</em> evaluate(&#123;<br />&nbsp;&nbsp;market, cost, execution<br />&#125;);</code>
      </div>
    </div>
  );
}
