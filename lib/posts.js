// Original sample content for this demo blog. Not copied from, or
// affiliated with, any real publication.

export const posts = [
  {
    slug: "event-loop-mental-model",
    title: "A Mental Model for the Event Loop That Actually Sticks",
    excerpt:
      "Most explanations of the event loop drown you in diagrams. Here's the three-sentence version that finally made it click for me.",
    category: "JavaScript",
    tags: ["javascript", "node", "fundamentals"],
    date: "2026-10-02",
    readTime: "6 min read",
    content: [
      "Every explanation of the event loop I read in my first year as a developer used the same diagram: a loop, a queue, a stack, arrows everywhere. It took way too long for any of it to stick.",
      "What finally worked was dropping the diagram entirely and thinking about it as a single rule: the runtime will always finish everything currently on the call stack before it looks at anything waiting in a queue. That's it. Everything else — microtasks jumping ahead of macrotasks, `setTimeout(fn, 0)` not running immediately, promises resolving before UI paints — falls out of that one rule.",
      "Once you internalize 'the stack always wins,' you stop guessing at execution order and start predicting it. Try tracing through a snippet with a mix of synchronous code, a promise, and a `setTimeout` — you'll find you can call the order correctly before running it.",
      "```js\nconsole.log('a');\nsetTimeout(() => console.log('b'), 0);\nPromise.resolve().then(() => console.log('c'));\nconsole.log('d');\n// a, d, c, b\n```",
      "The stack runs `a` and `d` first because they're synchronous. Then, before the next macrotask (the timeout), the microtask queue drains — so `c` beats `b` even though the timeout was scheduled first.",
      "That's the whole mental model. Everything you read about the event loop afterward is just detail on top of this one sentence.",
    ],
  },
  {
    slug: "rust-ownership-without-the-jargon",
    title: "Rust Ownership, Explained Without the Jargon",
    excerpt:
      "Borrow checker errors feel personal at first. They stop feeling that way once you see what the compiler is actually protecting you from.",
    category: "Rust",
    tags: ["rust", "systems", "fundamentals"],
    date: "2026-09-18",
    readTime: "8 min read",
    content: [
      "The first time the Rust compiler rejected my code over a borrow error, my instinct was to find a workaround — add a `.clone()`, wrap it in an `Rc`, make the error go away. That instinct is exactly backwards.",
      "Ownership rules exist to answer one question at compile time instead of at 3am in production: who is responsible for cleaning this memory up, and is anyone else still using it when that happens? In garbage-collected languages, the runtime answers that question for you, constantly, at a performance cost. Rust answers it once, at compile time, for free at runtime.",
      "A borrow checker error isn't the compiler being difficult. It's the compiler finding a spot where two parts of your program might disagree about who owns a piece of data — the exact class of bug that shows up as a segfault or a data race in other languages, except here it never ships.",
      "```rust\nfn main() {\n    let name = String::from(\"demo\");\n    let greeting = greet(name);\n    println!(\"{}\", name); // error: value borrowed after move\n}\n\nfn greet(s: String) -> String {\n    format!(\"hello, {}\", s)\n}\n```",
      "That error is the compiler asking: did you mean to give `greet` permanent ownership of `name`, or did you just want it to look at it? If the latter, borrow it with `&name` instead of moving it. The fix is almost always to say what you actually meant, not to fight the compiler into submission.",
      "Once ownership clicks, the rest of Rust gets easier — lifetimes are just ownership rules applied to references instead of values.",
    ],
  },
  {
    slug: "feature-flags-shipping-faster",
    title: "Feature Flags Are a Process Change, Not a Library",
    excerpt:
      "Teams install a flagging SDK and expect to ship faster immediately. The SDK is the easy 10%; the process change is the other 90%.",
    category: "Engineering",
    tags: ["engineering", "process", "deployment"],
    date: "2026-08-27",
    readTime: "5 min read",
    content: [
      "Every team I've seen adopt feature flags starts the same way: pick a library, wrap a few `if` statements around new code, call it done. Then nothing actually changes about how fast they ship, and they conclude flags were overhyped.",
      "The library was never the point. The point is decoupling 'merged to main' from 'visible to users' as two genuinely separate events — and that only pays off once the team changes how it works around that fact.",
      "Concretely, that means: merging incomplete work behind a flag instead of long-lived feature branches, deploying on a schedule instead of per-feature, and treating 'turn it on for 5% of traffic' as a normal Tuesday action instead of a special release event requiring a meeting.",
      "The hard part isn't the toggle, it's the cultural shift of trusting that 'merged' doesn't mean 'live' — and building the muscle to actually clean up stale flags before they turn into a maze of forgotten conditionals six months later.",
      "If you adopt the library without the process change, you'll get the maze without the speed. The speed only shows up once deploys and releases are actually decoupled in how the team thinks, not just in the code.",
    ],
  },
  {
    slug: "debugging-node-memory-leaks",
    title: "Finding a Memory Leak in Node Without Guessing",
    excerpt:
      "Heap snapshots look intimidating until you know the one comparison that actually finds the leak: snapshot, do the suspect action, snapshot again.",
    category: "Node.js",
    tags: ["node", "performance", "debugging"],
    date: "2026-07-11",
    readTime: "7 min read",
    content: [
      "Memory leak reports usually start the same way: 'the process grows over time and eventually gets OOM-killed.' The temptation is to stare at the code and guess where the leak is. That almost never works — leaks are rarely where your intuition points.",
      "The technique that actually works is comparative heap snapshotting: take a heap snapshot, perform whatever action you suspect is leaking several times, take a second snapshot, and diff them. Chrome DevTools (attached via `node --inspect`) will show you exactly which objects grew between the two snapshots and, critically, what's still holding a reference to them.",
      "```bash\nnode --inspect server.js\n# open chrome://inspect, attach, go to Memory tab\n# take snapshot 1 -> trigger suspect action x5 -> take snapshot 2\n# filter the comparison view by objects that only grew\n```",
      "Nine times out of ten, the retained objects trace back to one of three causes: an event listener that's added but never removed, a closure captured inside a long-lived cache, or a timer/interval that outlives the thing it was scheduled for. The diff view shows you the retaining path — the chain of references keeping the object alive — which tells you exactly which of the three it is without guessing.",
      "The discipline that matters here isn't memorizing every leak pattern. It's resisting the urge to read code and theorize, and instead letting the heap diff point you directly at the retained objects every time.",
    ],
  },
];

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug) || null;
}

export function getAllCategories() {
  return [...new Set(posts.map((p) => p.category))];
}

export function getAllTags() {
  return [...new Set(posts.flatMap((p) => p.tags))];
}
