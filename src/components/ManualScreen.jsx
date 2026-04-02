import { useState } from 'react';

const GLOSSARY = [
  { term: 'Active Spot', def: "The position where your main battling Pokémon sits. You must always have one Pokémon in the Active Spot. Only the Active Pokémon can attack or be attacked (normally)." },
  { term: 'Bench', def: "The area behind the Active Spot where up to 5 additional Pokémon wait. Benched Pokémon can receive Energy and evolve, but they can't attack. When your Active Pokémon is Knocked Out, you promote one from the Bench." },
  { term: 'Evolve', def: 'Playing a higher-stage Pokémon card on top of a matching lower-stage one. For example, placing "Charmeleon" (Stage 1) on top of "Charmander" (Basic). Evolving keeps all attached Energy and damage counters but clears Special Conditions.' },
  { term: 'Knocked Out (KO)', def: "When a Pokémon has damage equal to or greater than its HP, it's Knocked Out. It and all cards attached go to the discard pile. The player who scored the KO takes a Prize Card." },
  { term: 'Retreat', def: "Moving your Active Pokémon to the Bench and replacing it with a Benched one. You must discard Energy cards equal to the Retreat Cost. You may only retreat once per turn." },
  { term: 'Prize Cards', def: "The 6 face-down cards set aside during setup. Each KO earns you one Prize Card (some powerful Pokémon give up 2 or 3 when Knocked Out). Take your last Prize Card to win." },
  { term: 'Pokémon Checkup', def: "A between-turns step where Special Condition effects are resolved in order: Poisoned, Burned, Asleep, Paralyzed." },
  { term: 'Damage Counter', def: "A token placed on a Pokémon to track damage. Each counter represents 10 damage. When total counters × 10 equal or exceed HP, the Pokémon is Knocked Out." },
  { term: 'Ability', def: "A special power on some Pokémon cards separate from attacks. Unlike attacks, using an Ability doesn't end your turn." },
  { term: 'Rule of Four', def: "You can only have up to 4 copies of any card with the same name in your deck — except Basic Energy cards, which have no limit." },
];

function GlossaryItem({ term, def }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`manual-gloss-item ${open ? 'open' : ''}`}>
      <button className="manual-gloss-header" onClick={() => setOpen(!open)}>
        <span>{term}</span>
        <span className="manual-gloss-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="manual-gloss-body">{def}</div>}
    </div>
  );
}

export default function ManualScreen({ onNavigate }) {
  const [section, setSection] = useState(null);

  const chapters = [
    { id: 'what', label: 'What Is Pokémon?' },
    { id: 'history', label: 'History' },
    { id: 'cards', label: 'Card Types' },
    { id: 'energy', label: 'Energy Types' },
    { id: 'anatomy', label: 'Card Anatomy' },
    { id: 'setup', label: 'Game Setup' },
    { id: 'turns', label: 'Turn Structure' },
    { id: 'attacking', label: 'Attacking' },
    { id: 'weakness', label: 'Weakness & Resistance' },
    { id: 'status', label: 'Status Conditions' },
    { id: 'winning', label: 'How to Win' },
    { id: 'glossary', label: 'Glossary' },
  ];

  const handleBack = () => {
    if (section) {
      setSection(null);
    } else {
      onNavigate('home');
    }
  };

  const currentIndex = section ? chapters.findIndex(ch => ch.id === section) : -1;
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const goToChapter = (id) => {
    setSection(id);
    window.scrollTo({ top: 0 });
  };

  const chapterNav = section && (
    <div className="manual-chapter-nav">
      {prevChapter ? (
        <button className="btn btn-back manual-nav-prev" onClick={() => goToChapter(prevChapter.id)}>
          ← {prevChapter.label}
        </button>
      ) : <span />}
      {nextChapter ? (
        <button className="btn btn-back manual-nav-next" onClick={() => goToChapter(nextChapter.id)}>
          {nextChapter.label} →
        </button>
      ) : <span />}
    </div>
  );

  return (
    <div className="manual-screen">
      <div className="manual-header">
        <button className="btn btn-back" onClick={handleBack}>
          ← Back
        </button>
        <h2 className="manual-title">TCG Manual</h2>
      </div>

      {!section && (
        <div className="manual-toc">
          <p className="manual-subtitle">
            The complete beginner's primer — everything you need to play with confidence.
          </p>
          <div className="manual-chapter-list">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                className="manual-chapter-btn"
                onClick={() => goToChapter(ch.id)}
              >
                <span className="manual-ch-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="manual-ch-label">{ch.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {section === 'what' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 01</div>
          <h3>What Is Pokémon?</h3>
          <p>Pokémon (short for "Pocket Monsters") is a fictional universe created in Japan in 1996 by game designer Satoshi Tajiri and illustrator Ken Sugimori. In this world, humans known as <strong>Trainers</strong> capture and befriend creatures called <strong>Pokémon</strong> — each with unique abilities, elemental powers, and personalities.</p>
          <p>There are over 1,000 different species of Pokémon. Some breathe fire, some control water, some create electricity, and many evolve into stronger forms as they grow.</p>
          <p>The franchise spans video games, an animated TV series, movies, toys, and — most relevant to us — a <strong>Trading Card Game (TCG)</strong>. In the card game, you play as a Pokémon Trainer, using a deck of cards to battle another Trainer's team.</p>
          <div className="manual-card manual-card-blue">
            <h4>Why People Love It</h4>
            <p>The TCG blends strategic depth with accessible rules. Building a deck is creative and personal. Games are fast (usually 15–25 minutes) and every match unfolds differently.</p>
          </div>
        </div>
      )}

      {section === 'history' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 02</div>
          <h3>A Brief History</h3>
          <p>The Pokémon TCG launched in Japan on October 20, 1996, published by Media Factory and developed by Creatures Inc. The first set — the "Base Set" — featured 102 cards with iconic creatures like Charizard, Blastoise, and Pikachu.</p>
          <p>In January 1999, Wizards of the Coast brought the card game to North America. "Pokémania" was at fever pitch with the animated TV series airing worldwide, and the card game became an instant cultural phenomenon.</p>
          <p>As of 2025, over 75 billion cards have been produced worldwide in 16 languages, sold in over 90 countries. It remains one of the most popular trading card games ever created.</p>
          <div className="manual-tip">
            <span>TIP:</span> The rarest Pokémon card is the "Pikachu Illustrator," originally created as a prize for a 1997 Japanese art contest. Only about 41 were ever printed.
          </div>
        </div>
      )}

      {section === 'cards' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 03</div>
          <h3>The Three Types of Cards</h3>
          <p>Every 60-card deck is built from exactly three types of cards:</p>
          <div className="manual-card manual-card-red">
            <h4>Pokémon Cards</h4>
            <p>Your battlers. Each has Hit Points (HP), attacks, a type, and sometimes Abilities. They come in three stages: <strong>Basic</strong> (played directly), <strong>Stage 1</strong> (evolves from Basic), and <strong>Stage 2</strong> (evolves from Stage 1). You must always have at least one Pokémon in play.</p>
          </div>
          <div className="manual-card manual-card-yellow">
            <h4>Energy Cards</h4>
            <p>The fuel for your Pokémon's attacks. Attach Energy cards to your Pokémon to power their moves. <strong>Basic Energy</strong> has no limit per deck. <strong>Special Energy</strong> provides extra effects but is limited to 4 copies.</p>
          </div>
          <div className="manual-card manual-card-blue">
            <h4>Trainer Cards</h4>
            <p>Items, tools, and allies that support your strategy. Subtypes: <strong>Item</strong> (play as many as you want), <strong>Supporter</strong> (one per turn), <strong>Stadium</strong> (one per turn, affects both players), and <strong>Pokémon Tools</strong> (attach for ongoing effects).</p>
          </div>
        </div>
      )}

      {section === 'energy' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 04</div>
          <h3>Energy Types</h3>
          <p>There are 11 Energy types in the TCG, each with strengths and weaknesses against others.</p>
          <div className="manual-energy-grid">
            {[
              { name: 'Grass', color: '#78C850', desc: 'Plants, bugs, forests' },
              { name: 'Fire', color: '#F08030', desc: 'Flames, heat, volcanoes' },
              { name: 'Water', color: '#6890F0', desc: 'Oceans, ice, rain' },
              { name: 'Lightning', color: '#F8D030', desc: 'Electricity, storms' },
              { name: 'Psychic', color: '#F85888', desc: 'Mind, ghosts, poison' },
              { name: 'Fighting', color: '#C03028', desc: 'Martial arts, rocks' },
              { name: 'Darkness', color: '#705848', desc: 'Shadows, trickery' },
              { name: 'Metal', color: '#B8B8D0', desc: 'Steel, armor, machines' },
              { name: 'Dragon', color: '#7038F8', desc: 'Mythical, multi-type cost' },
              { name: 'Fairy', color: '#EE99AC', desc: 'Magic, charm (legacy)' },
              { name: 'Colorless', color: '#A8A878', desc: 'Neutral — any Energy works' },
            ].map(e => (
              <div key={e.name} className="manual-energy-item">
                <div className="manual-energy-dot" style={{ background: e.color }} />
                <div className="manual-energy-name" style={{ color: e.color }}>{e.name}</div>
                <div className="manual-energy-desc">{e.desc}</div>
              </div>
            ))}
          </div>
          <div className="manual-tip">
            <span>TIP:</span> When an attack cost shows a Colorless symbol, you can pay it with <em>any</em> type of Energy. There are no Basic Colorless or Dragon Energy cards.
          </div>
        </div>
      )}

      {section === 'anatomy' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 05</div>
          <h3>Reading a Pokémon Card</h3>
          <p>Every Pokémon card packs a lot of information into a small space:</p>
          <div className="manual-card">
            <h4>Top of the Card</h4>
            <p><strong>Name</strong> — the Pokémon's name and any special designation. The <strong>Stage</strong> is in the upper left. <strong>HP</strong> (Hit Points) is in the upper right. The <strong>Type symbol</strong> beside HP tells you the elemental type.</p>
          </div>
          <div className="manual-card manual-card-blue">
            <h4>Middle of the Card</h4>
            <p>The <strong>artwork</strong> dominates the center. Below it: <strong>Abilities</strong> (special powers) and <strong>Attacks</strong>. Each attack shows the <strong>Energy cost</strong> (left), <strong>attack name</strong>, <strong>damage number</strong> (right), and a text description of effects.</p>
          </div>
          <div className="manual-card manual-card-yellow">
            <h4>Bottom of the Card</h4>
            <p><strong>Weakness</strong> — which type deals double damage. <strong>Resistance</strong> — which type deals reduced damage (−30). <strong>Retreat Cost</strong> — Energy you must discard to swap to your Bench.</p>
          </div>
        </div>
      )}

      {section === 'setup' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 06</div>
          <h3>Setting Up the Game</h3>
          <div className="manual-steps">
            <div className="manual-step"><div className="manual-step-num">1</div><div><h4>Shake Hands & Shuffle</h4><p>Both players shuffle their 60-card decks. A coin flip determines who goes first (the first player cannot attack on their first turn).</p></div></div>
            <div className="manual-step"><div className="manual-step-num">2</div><div><h4>Draw 7 Cards</h4><p>Each player draws 7 cards as their opening hand.</p></div></div>
            <div className="manual-step"><div className="manual-step-num">3</div><div><h4>Place Your Active Pokémon</h4><p>Choose 1 Basic Pokémon from your hand and place it face-down in your Active Spot. If you have no Basic Pokémon, reveal your hand, shuffle it back, and draw 7 new cards. Your opponent gets to draw 1 extra card each time.</p></div></div>
            <div className="manual-step"><div className="manual-step-num">4</div><div><h4>Fill Your Bench (Optional)</h4><p>Place any additional Basic Pokémon from your hand face-down on your Bench (up to 5).</p></div></div>
            <div className="manual-step"><div className="manual-step-num">5</div><div><h4>Set Aside Prize Cards</h4><p>Each player takes the top 6 cards of their deck and places them face-down as <strong>Prize Cards</strong>.</p></div></div>
            <div className="manual-step"><div className="manual-step-num">6</div><div><h4>Flip Cards & Begin!</h4><p>Both players flip their Pokémon face-up. The first player draws a card and begins.</p></div></div>
          </div>
          <div className="manual-play-area">
            <h4>Play Area Layout</h4>
            <div className="manual-side-label">— OPPONENT —</div>
            <div className="manual-zones">
              <div className="manual-zone"><div className="manual-zone-label">Deck</div><div className="manual-zone-desc">Draw pile</div></div>
              <div className="manual-zone"><div className="manual-zone-label">Prizes</div><div className="manual-zone-desc">6 face-down</div></div>
              <div className="manual-zone manual-zone-active"><div className="manual-zone-label">Active</div><div className="manual-zone-desc">Battler</div></div>
              <div className="manual-zone"><div className="manual-zone-label">Bench</div><div className="manual-zone-desc">Up to 5</div></div>
              <div className="manual-zone"><div className="manual-zone-label">Discard</div><div className="manual-zone-desc">Used cards</div></div>
            </div>
            <div className="manual-side-label">— YOUR SIDE —</div>
            <div className="manual-zones">
              <div className="manual-zone"><div className="manual-zone-label">Discard</div><div className="manual-zone-desc">Used cards</div></div>
              <div className="manual-zone"><div className="manual-zone-label">Bench</div><div className="manual-zone-desc">Up to 5</div></div>
              <div className="manual-zone manual-zone-active"><div className="manual-zone-label">Active</div><div className="manual-zone-desc">Battler</div></div>
              <div className="manual-zone"><div className="manual-zone-label">Prizes</div><div className="manual-zone-desc">6 face-down</div></div>
              <div className="manual-zone"><div className="manual-zone-label">Deck</div><div className="manual-zone-desc">Draw pile</div></div>
            </div>
          </div>
        </div>
      )}

      {section === 'turns' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 07</div>
          <h3>What You Do on Your Turn</h3>
          <p>Every turn follows three phases: <strong>Draw</strong>, <strong>Do Things</strong>, and <strong>Attack</strong>.</p>
          <div className="manual-card manual-card-green">
            <h4>Phase 1 — Draw a Card</h4>
            <p>You must draw exactly one card. If your deck is empty and you can't draw, you lose immediately.</p>
          </div>
          <div className="manual-card manual-card-blue">
            <h4>Phase 2 — Do Things (any order)</h4>
            <p>This is the action phase:</p>
          </div>
          <div className="manual-action-table">
            <div className="manual-action-row manual-action-header">
              <span>Action</span><span>Limit</span>
            </div>
            <div className="manual-action-row"><span>Play Basic Pokémon to Bench</span><span className="manual-limit-many">Many</span></div>
            <div className="manual-action-row"><span>Evolve Pokémon</span><span className="manual-limit-many">Many</span></div>
            <div className="manual-action-row"><span>Attach Energy</span><span className="manual-limit-one">1/turn</span></div>
            <div className="manual-action-row"><span>Play Item Cards</span><span className="manual-limit-many">Many</span></div>
            <div className="manual-action-row"><span>Play a Supporter Card</span><span className="manual-limit-one">1/turn</span></div>
            <div className="manual-action-row"><span>Play a Stadium Card</span><span className="manual-limit-one">1/turn</span></div>
            <div className="manual-action-row"><span>Use Abilities</span><span className="manual-limit-many">Many</span></div>
            <div className="manual-action-row"><span>Retreat Active Pokémon</span><span className="manual-limit-one">1/turn</span></div>
          </div>
          <div className="manual-card">
            <h4>Phase 3 — Attack</h4>
            <p>Declare one of your Active Pokémon's attacks (if it has enough Energy). Apply damage and effects. <strong>Your turn is now over.</strong></p>
          </div>
        </div>
      )}

      {section === 'attacking' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 08</div>
          <h3>How Attacking Works</h3>
          <div className="manual-steps">
            <div className="manual-step"><div className="manual-step-num">A</div><div><h4>Check Energy</h4><p>Make sure your Active Pokémon has enough Energy attached. The Energy stays attached — it doesn't get used up (unless the attack says otherwise).</p></div></div>
            <div className="manual-step"><div className="manual-step-num">B</div><div><h4>Check Weakness & Resistance</h4><p>If the defending Pokémon is <strong>Weak</strong> to your type, double the damage. If <strong>Resistant</strong>, subtract 30.</p></div></div>
            <div className="manual-step"><div className="manual-step-num">C</div><div><h4>Place Damage Counters</h4><p>Each counter = 10 HP. If total damage equals or exceeds HP, the Pokémon is <strong>Knocked Out</strong>.</p></div></div>
            <div className="manual-step"><div className="manual-step-num">D</div><div><h4>Knock Out & Prizes</h4><p>The KO'd Pokémon and all attached cards go to the discard pile. You take one Prize Card. Your opponent promotes a Benched Pokémon.</p></div></div>
          </div>
          <div className="manual-tip">
            <span>NOTE:</span> Only your Active Pokémon can attack the opponent's Active Pokémon (unless an attack specifically says otherwise). The first player cannot attack on their very first turn.
          </div>
        </div>
      )}

      {section === 'weakness' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 09</div>
          <h3>Weakness & Resistance</h3>
          <p>Printed on each Pokémon card in the lower-left area, adding strategy based on type matchups.</p>
          <div className="manual-card manual-card-red">
            <h4>Weakness (x2)</h4>
            <p>Attacks from the Weakness type deal <strong>double damage</strong>. A Fire Pokémon's 60-damage attack against a Grass-type weak to Fire deals 120 damage instead.</p>
          </div>
          <div className="manual-card manual-card-green">
            <h4>Resistance (-30)</h4>
            <p>Attacks from the Resistance type deal <strong>30 less damage</strong>. Not all Pokémon have Resistance. Weakness is applied first, then Resistance.</p>
          </div>
          <div className="manual-tip">
            <span>TIP:</span> Weakness and Resistance are based on the <em>attacking Pokémon's type</em>, not the type of Energy used to pay for the attack.
          </div>
        </div>
      )}

      {section === 'status' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 10</div>
          <h3>Special Conditions</h3>
          <p>Certain attacks can inflict Special Conditions. Cure them by retreating, evolving, or using certain Items/Abilities.</p>
          <div className="manual-status-grid">
            <div className="manual-status-card" style={{ borderColor: '#9b59b6' }}>
              <h4 style={{ color: '#9b59b6' }}>Poisoned</h4>
              <p>During every Pokémon Checkup, takes 1 damage counter (10 damage). Doesn't go away on its own.</p>
            </div>
            <div className="manual-status-card" style={{ borderColor: '#F08030' }}>
              <h4 style={{ color: '#F08030' }}>Burned</h4>
              <p>During Checkup, 2 damage counters (20 damage), then flip a coin — heads cures, tails stays.</p>
            </div>
            <div className="manual-status-card" style={{ borderColor: '#6890F0' }}>
              <h4 style={{ color: '#6890F0' }}>Asleep</h4>
              <p>Can't attack or retreat. During Checkup, flip a coin — heads wakes up, tails stays Asleep.</p>
            </div>
            <div className="manual-status-card" style={{ borderColor: '#F8D030' }}>
              <h4 style={{ color: '#F8D030' }}>Paralyzed</h4>
              <p>Can't attack or retreat. Auto-recovers at the end of owner's next turn.</p>
            </div>
            <div className="manual-status-card" style={{ borderColor: '#e67e22' }}>
              <h4 style={{ color: '#e67e22' }}>Confused</h4>
              <p>When attacking, flip a coin — heads proceeds normally, tails cancels the attack and takes 3 damage counters (30 damage) to itself.</p>
            </div>
          </div>
          <div className="manual-card manual-card-blue">
            <h4>Stacking Rules</h4>
            <p><strong>Poisoned</strong> and <strong>Burned</strong> can coexist with each other and with any other condition. <strong>Asleep</strong>, <strong>Paralyzed</strong>, and <strong>Confused</strong> are mutually exclusive — a new one replaces the old.</p>
          </div>
        </div>
      )}

      {section === 'winning' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 11</div>
          <h3>How to Win the Game</h3>
          <p>There are three ways to win — you only need one:</p>
          <div className="manual-win-grid">
            <div className="manual-win-card">
              <h4>Take All Prize Cards</h4>
              <p>Each KO earns you a Prize Card. Take your sixth and final Prize Card, and you win. This is the most common path to victory.</p>
            </div>
            <div className="manual-win-card">
              <h4>Wipe Out All Pokémon</h4>
              <p>If you KO your opponent's Active Pokémon and they have no Benched Pokémon to replace it, you win immediately.</p>
            </div>
            <div className="manual-win-card">
              <h4>Deck Out Your Opponent</h4>
              <p>If their deck is empty and they can't draw at the start of their turn, they lose.</p>
            </div>
          </div>
        </div>
      )}

      {section === 'glossary' && (
        <div className="manual-content">
          <div className="manual-section-num">Chapter 12</div>
          <h3>Quick Glossary</h3>
          <p>Key terms — tap any term to expand:</p>
          <div className="manual-glossary">
            {GLOSSARY.map(g => (
              <GlossaryItem key={g.term} term={g.term} def={g.def} />
            ))}
          </div>
          <div className="manual-tip">
            <span>TIP:</span> The best way to learn is by playing! Pick up a pre-built "Battle Deck" or try the free digital version, Pokémon TCG Live, which has a built-in tutorial.
          </div>
        </div>
      )}

      {chapterNav}
    </div>
  );
}
