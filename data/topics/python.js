window.registerTopic('python', {
  why: `Python questions in a placement round test whether you understand the **object model** behind the friendly syntax: everything is an object, names are references, some objects are mutable and some are not. Interviewers start with "what is Python / interpreted or compiled", move to data types and mutability, then to idioms (comprehensions, lambdas, \`*args\`/\`**kwargs\`, decorators, generators) and finish with runtime topics such as memory management and the GIL. Recent papers add the 3.8–3.11 features: walrus operator, \`match\`/\`case\`, exception groups.

Good answers are short, name the exact built-in, and give a two-line example.`,
  notes: [
    { h: 'What Python is', md: `Created by **Guido van Rossum**, first released in **1991**. High-level, general-purpose, dynamically typed, object-oriented, open source, portable, with a huge standard and third-party library. It is **partly compiled and partly interpreted**: source is compiled to bytecode, which the Python virtual machine executes. Indentation is **required**; it defines blocks. \`#\` starts a comment, and docstrings (triple-quoted strings right under a def/class) are reachable through \`__doc__\` or \`help()\`.

**Dynamically typed** means the interpreter attaches a type to a value at run time; you never declare variable types (contrast with statically typed languages where the compiler needs the declaration).` },
    { h: 'Data types and mutability', md: `Built-in categories: **Numeric** (int, float, complex, bool), **Sequence** (str, list, tuple, range), **Mapping** (dict), **Set** (set, frozenset).

- **Mutable**: list, dict, set — can be changed in place.
- **Immutable**: int, float, str, tuple — any "change" creates a new object.

**List vs tuple**: lists are mutable, use more memory, suit insertion and deletion; tuples are immutable, lighter, faster to iterate and can be dict keys. **Set vs dict**: a set is an unordered collection of unique items; a dict maps keys to values and (since 3.7) preserves insertion order.

Arguments are passed as **references to objects**: rebinding the parameter does nothing outside, but mutating a mutable argument is visible to the caller.` },
    { h: 'Idioms interviewers ask you to write', md: `\`\`\`python
squares = [i * i for i in range(1, 10)]          # list comprehension
lookup  = {i: i + 7 for i in range(1, 10)}        # dict comprehension
gen     = (i for i in (1, 2, 3))                  # NOT a tuple comprehension: a generator
mul     = lambda x, y: x * y                      # anonymous one-expression function
\`\`\`

- \`*args\` collects extra positional arguments as a tuple, \`**kwargs\` extra keyword arguments as a dict.
- Functions are objects, so they can be passed as arguments (higher-order functions) and returned.
- \`/\` is true division (5/2 → 2.5), \`//\` is floor division (5//2 → 2). \`math.floor\` and \`math.ceil\` round down/up.
- Slicing \`seq[start:stop:step]\` returns a new sequence.
- \`zip()\` pairs items from several iterables into tuples; \`swapcase()\` flips letter case.
- \`range()\` in Python 3 is lazy, like Python 2's \`xrange\`; the old \`range()\` built a list.
- \`break\` exits a loop, \`continue\` skips to the next iteration, \`pass\` is a no-op placeholder.` },
    { h: 'Decorators, iterators, generators', md: `A **decorator** is a function that takes a function and returns a wrapped version, applied with \`@name\` above the definition; it is the idiomatic way to add logging, timing or caching without touching the body.

An **iterator** implements \`__iter__\` and \`__next__\`. A **generator** is a function containing \`yield\`: calling it returns an iterator, and each \`yield\` pauses the function, saving its state, until the next value is requested. Generators give lazy evaluation and tiny memory use for large sequences.

**Monkey patching** means modifying a class or module at run time (e.g. replacing a method on an imported class). It is powerful in tests and dangerous in production.` },
    { h: 'OOP, scope and access', md: `\`__init__\` is the initialiser called when an object is created (the "constructor" in interview language). Python supports **multiple inheritance**, **polymorphism** (child redefines a parent method), **encapsulation** (class bundles data and methods) and **abstraction** via abstract base classes.

Access control is by convention: no prefix = public, single underscore \`_x\` = protected (for subclasses), double underscore \`__x\` = private (name-mangled).

Scope lookup follows **LEGB**: Local, Enclosing, Global, Built-in. A **namespace** keeps names unique; **pip** installs packages; \`python -m pdb script.py\` starts the debugger; \`os.remove\`/\`os.unlink\` delete files; \`pickle\` serialises objects (pickling) and restores them (unpickling).` },
    { h: 'Runtime: memory, sorting, GIL, exceptions', md: `Python keeps objects in a **private heap** managed by the interpreter, with reference counting plus a garbage collector that reclaims cycles. \`sort()\` and \`sorted()\` use **Timsort**, a stable hybrid of merge sort and insertion sort, O(n log n) worst case.

The **Global Interpreter Lock (GIL)** lets only one thread execute Python bytecode at a time, so CPU-bound threads do not run in parallel; use multiprocessing for CPU work and threads/asyncio for I/O.

Exceptions: \`try\` guards code, \`except\` handles, \`finally\` always runs for cleanup. **Function annotations** add type metadata that Python itself ignores but tools like mypy check. **Unit tests** use the xUnit-style \`unittest\` framework. Shallow copy copies the container, deep copy copies the contents recursively.` },
    { h: 'Python 3.8–3.11 features', md: `- **Walrus operator** \`:=\` (3.8) assigns inside an expression: \`if (name := input()) in names:\`.
- **Structural pattern matching** \`match\`/\`case\` (3.10) is Python's switch; \`case _:\` is the default.
- **Exception groups** and \`except*\` (3.11) let one \`try\` handle several simultaneous exceptions of different types.` },
  ],
  pitfalls: [
    'Saying Python is "interpreted" and stopping. Mention bytecode compilation and the virtual machine.',
    'Calling `(i for i in x)` a tuple comprehension. It is a generator expression; tuples have no comprehension syntax.',
    'Describing argument passing as "by value" or "by reference". It is by object reference: rebinding is local, mutation is shared.',
    'Claiming threads make CPU-bound Python faster. The GIL serialises bytecode execution; use multiprocessing.',
    'Mixing up `/` and `//`, or forgetting that `sort()` mutates in place while `sorted()` returns a new list.',
  ],
  model: [
    { q: 'Is Python compiled or interpreted?', a: 'Both, in stages. The source is first compiled to bytecode (the `.pyc` files), and that bytecode is then executed by the Python virtual machine for the current platform. So people call it interpreted, but there is a compilation step every run.', ref: 'python-3' },
    { q: 'What are generators and why use them over lists?', a: 'A generator is a function with `yield`. Calling it returns an iterator that produces values on demand: each `yield` suspends the function and remembers its state. Because values are produced lazily, a generator can represent huge or infinite sequences with constant memory, whereas a list materialises everything up front. Generator expressions `(x for x in data)` give the same benefit inline.', ref: 'python-33' },
    { q: 'What is the GIL and what does it mean for multithreading?', a: 'The Global Interpreter Lock is a mutex in CPython that allows only one thread to execute Python bytecode at a time. Threads still help for I/O-bound work because the lock is released while waiting, but CPU-bound code gets no speed-up from threads; the usual answer is the `multiprocessing` module or native extensions.', ref: 'python-50' },
  ],
  quiz: [
    { type: 'mcq', q: 'Which group lists only immutable types?', options: ['list, dict, set', 'str, tuple, int', 'list, tuple, str', 'dict, str, set'], answer: 1, explain: 'Strings, tuples and numbers cannot change in place; lists, dicts and sets can.', ref: 'python-5' },
    { type: 'mcq', q: 'What does `(i for i in (1, 2, 3))` create?', options: ['A tuple', 'A list', 'A generator object', 'A set'], answer: 2, explain: 'Parentheses around a comprehension make a generator expression, never a tuple.', ref: 'python-26' },
    { type: 'mcq', q: '`5 // 2` evaluates to…', options: ['2.5', '2', '3', '2.0'], answer: 1, explain: '`//` is floor division; `/` would give 2.5.', ref: 'python-11' },
    { type: 'mcq', q: 'Which algorithm do `sort()` and `sorted()` use?', options: ['Quicksort', 'Heapsort', 'Timsort', 'Bubble sort'], answer: 2, explain: 'Timsort is a stable hybrid of merge and insertion sort with O(n log n) worst case.', ref: 'python-29' },
    { type: 'mcq', q: 'What is the effect of the GIL on CPU-bound threads?', options: ['They run in parallel on all cores', 'Only one thread executes bytecode at a time, so no speed-up', 'They are converted to processes automatically', 'They raise a RuntimeError'], answer: 1, explain: 'The GIL serialises bytecode execution; use multiprocessing for CPU-bound parallelism.', ref: 'python-50' },
    { type: 'mcq', q: 'Which prefix marks a "private" attribute by convention and triggers name mangling?', options: ['`_x`', '`__x`', '`x_`', '`@x`'], answer: 1, explain: 'Double underscore is private (mangled to `_Class__x`); single underscore is protected.', ref: 'python-48' },
    { type: 'mcq', q: 'The walrus operator `:=`…', options: ['compares two values', 'assigns a value inside an expression', 'defines a lambda', 'creates a tuple'], answer: 1, explain: 'Available from Python 3.8; useful in `while` and `if` conditions to reuse a computed value.', ref: 'python-54' },
    { type: 'mcq', q: 'Which keyword introduces structural pattern matching (Python 3.10)?', options: ['switch', 'select', 'match', 'when'], answer: 2, explain: '`match term:` with `case pattern:` clauses and `case _:` as the default.', ref: 'python-53' },
    { type: 'short', q: 'How are arguments passed in Python?', a: 'Every variable holds a reference to an object and the reference is what gets passed. Rebinding the parameter inside the function has no effect outside, but mutating a mutable object (list, dict) through that reference is visible to the caller.', ref: 'python-6' },
    { type: 'short', q: 'What are `*args` and `**kwargs`?', a: '`*args` gathers any extra positional arguments into a tuple; `**kwargs` gathers extra keyword arguments into a dict. They let a function accept a variable number of arguments, and the same stars unpack sequences and dicts when calling.', ref: 'python-16' },
    { type: 'short', q: 'Explain decorators in one paragraph with an example use.', a: 'A decorator is a callable that takes a function and returns a new function, usually wrapping the original to add behaviour. Writing `@timer` above `def work():` is the same as `work = timer(work)`. Typical uses: logging, timing, caching (`functools.lru_cache`), access checks.', ref: 'python-30' },
  ],
  cards: [
    { f: 'Mutable vs immutable types', b: 'Mutable: list, dict, set. Immutable: int, float, str, tuple, frozenset.', ref: 'python-5' },
    { f: 'List vs tuple', b: 'List: mutable, more memory, good for insert/delete. Tuple: immutable, lighter, faster iteration, hashable.', ref: 'python-27' },
    { f: '/ vs //', b: '`/` true division (5/2 = 2.5); `//` floor division (5//2 = 2).', ref: 'python-11' },
    { f: 'Generator', b: 'Function with `yield`; returns an iterator that produces values lazily, pausing and resuming with saved state.', ref: 'python-33' },
    { f: 'Decorator', b: 'Function that wraps another function and returns the wrapper; applied with `@name`.', ref: 'python-30' },
    { f: 'Scope rule', b: 'LEGB: Local → Enclosing → Global → Built-in.', ref: 'python-18' },
    { f: 'GIL', b: 'Global Interpreter Lock: one thread runs bytecode at a time in CPython; threads help I/O, not CPU.', ref: 'python-50' },
    { f: 'sort() vs sorted()', b: 'Both Timsort. `list.sort()` mutates in place and returns None; `sorted()` returns a new list from any iterable.', ref: 'python-29' },
    { f: 'Access modifiers by convention', b: 'public `x`, protected `_x`, private `__x` (name-mangled).', ref: 'python-48' },
    { f: 'Pickling', b: '`pickle.dump` serialises an object to bytes/file; `pickle.load` restores it (unpickling).', ref: 'python-44' },
    { f: 'Walrus operator', b: '`:=` assigns within an expression (3.8+): `if (n := len(x)) > 3:`', ref: 'python-54' },
    { f: 'match / case', b: 'Structural pattern matching (3.10+); `case _:` is the default branch.', ref: 'python-53' },
  ],
  coding: [
    { id: 'comprehension', title: 'Comprehensions: squares of even numbers', prompt: 'Return a list of the squares of the even numbers from 1 to `n` inclusive using one list comprehension. (This runner executes JavaScript; write the Python in the box, then compare with the solution and run the JS equivalent if you like.)', starter: '# Python\ndef even_squares(n):\n    return [ ... ]\n\n# print(even_squares(10))  # [4, 16, 36, 64, 100]\n\n// JS equivalent you can run here:\nconst evenSquares = n => Array.from({length: n}, (_, i) => i + 1).filter(i => i % 2 === 0).map(i => i * i);\nconsole.log(evenSquares(10));', solution: 'def even_squares(n):\n    return [i * i for i in range(1, n + 1) if i % 2 == 0]', notes: 'The filter clause goes last; `range` is half-open so use `n + 1`.', ref: 'python-8' },
    { id: 'generator', title: 'Write a generator for Fibonacci numbers', prompt: 'Write `fib()` that yields Fibonacci numbers forever, then take the first 10 with `itertools.islice`. Explain why a generator is preferable to a list here.', starter: '# Python\ndef fib():\n    a, b = 0, 1\n    while True:\n        ...\n\n// JS equivalent you can run:\nfunction* fib(){ let [a,b]=[0,1]; while(true){ yield a; [a,b]=[b,a+b]; } }\nconst it = fib(); console.log(Array.from({length:10}, () => it.next().value));', solution: 'from itertools import islice\n\ndef fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\nprint(list(islice(fib(), 10)))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]', notes: 'The sequence is infinite, so a list is impossible; the generator produces one value per request with constant memory.', ref: 'python-33' },
    { id: 'decorator', title: 'Write a timing decorator', prompt: 'Write `@timed` that prints how long the wrapped function took, preserving the original name with `functools.wraps`.', starter: '# Python\nimport time, functools\n\ndef timed(fn):\n    ...\n\n@timed\ndef work():\n    sum(range(10**6))', solution: 'import time, functools\n\ndef timed(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        try:\n            return fn(*args, **kwargs)\n        finally:\n            print(f"{fn.__name__} took {time.perf_counter() - start:.4f}s")\n    return wrapper', notes: '`*args, **kwargs` forward any signature; `finally` guarantees the print even if the function raises.', ref: 'python-30' },
  ],
});
