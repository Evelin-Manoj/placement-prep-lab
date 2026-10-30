window.registerTopic('cpp', {
  why: `C++ shows up in campus placements and service-company screens as a **vocabulary and reasoning check**, even for roles that will never compile a line of it. Interviewers want to hear that you can define a term precisely (reference, virtual function, storage class), contrast two related things (struct vs class, new vs malloc, overloading vs overriding) and connect them to memory and object lifetime.

Expect a ladder: definitions first, then "difference between" tables, then OOP concepts with an example, then a few expert questions on \`volatile\`, \`mutable\`, inline and virtual destructors. Answer in the same shape: one-line definition, one contrast, one concrete example.`,
  notes: [
    { h: 'References, pointers and parameter passing', md: `A **reference** is an alias for an existing variable, declared with \`&\`; it must be initialised, can never be null and cannot be reseated. A **pointer** stores an address, may be null, can be reassigned, supports arithmetic and needs \`->\` / \`*\` to reach the target.

\`\`\`cpp
int gfg = 10;
int& ref = gfg;   // alias: changing ref changes gfg
int* ptr = &gfg;  // address: *ptr == 10, ptr can move
\`\`\`

**Call by value** copies the argument; changes inside the function never reach the caller. **Call by reference** passes the variable itself (or its address), so changes are visible outside and no copy is made. Use the memory argument in interviews: by-value stores actual and formal parameters in different locations, by-reference in the same one.` },
    { h: 'Memory: new/malloc, delete/delete[], void and this pointers', md: `- \`new\` is an **operator** that allocates *and* calls the constructor, returning the exact type; \`malloc\` is a **function** returning \`void*\` that never calls constructors.
- \`delete\` frees one object created with \`new\`; \`delete[]\` frees an array created with \`new[]\` and runs every element's destructor. Mixing them is undefined behaviour.
- Permitted pointer operations: increment/decrement, adding or subtracting an integer, comparing pointers of the same type.
- A **void pointer** holds any address but must be cast before dereferencing.
- \`this\` is the implicit pointer every non-static member function receives; it refers to the calling object and lets you return \`*this\` for chaining.
- **Shallow copy** duplicates only the top-level fields (two objects share the same pointed-to data); **deep copy** duplicates everything the object owns. Write a copy constructor when the class owns raw resources.` },
    { h: 'OOP in four words plus two mechanisms', md: `**Class** (user-defined type, a blueprint), **object** (an instance with state), **abstraction** (show only what matters), **encapsulation** (bundle data and methods, guard with access modifiers), **inheritance** (derive from an existing class to reuse and extend), **polymorphism** (one interface, many forms).

Access modifiers: \`private\` (class only), \`protected\` (class and derived classes), \`public\` (everyone). A **friend** function or class is granted access to private and protected members; a friend function is really a global function, not a member.

**Multiple inheritance** lets one class derive from several bases (the "Dad + Mom → child" example). **Virtual inheritance** guarantees a single copy of a shared base when the diamond pattern appears.` },
    { h: 'Polymorphism: compile time vs run time', md: `| | Compile-time (static/early binding) | Run-time (dynamic/late binding) |
| --- | --- | --- |
| Achieved by | function overloading, operator overloading | virtual functions, function overriding |
| Resolved | by the compiler | at execution through the vtable |
| Speed | faster | slightly slower |

**Overloading**: same name, different parameter lists. **Overriding**: same signature redefined in a derived class. A **virtual function** has a body in the base and may be overridden; a **pure virtual function** (\`= 0\`) has no base definition and makes the class **abstract**, which cannot be instantiated but can be pointed to. Calling a virtual function from a constructor is allowed but dispatches to the base version, which is the classic trap.` },
    { h: 'Constructors and destructors', md: `Three constructor kinds: **default** (no arguments, generated if you write none), **parameterised** (initialises from arguments and enables constructor overloading), **copy** (takes a reference to another object of the same class). Destructors share the class name with a \`~\` prefix, take no arguments, cannot be overloaded (one per class) and run in reverse order of construction.

Make the destructor **virtual** in any polymorphic base class; otherwise deleting a derived object through a base pointer runs only the base destructor and leaks the derived part.` },
    { h: 'Keywords interviewers love', md: `- \`static\` data member: one copy shared by all objects, initialised to zero before \`main\`; static member functions can be called through the class name and may only touch static members.
- \`inline\`: a *request* to paste the body at the call site; recursive functions cannot be inlined and the compiler may ignore the hint.
- \`volatile\`: tells the compiler the value may change unexpectedly (hardware registers, signal handlers), disabling optimisations that cache it.
- \`mutable\`: allows a data member to change even inside a \`const\` member function or const object.
- \`auto\`: type deduction at compile time; no runtime cost.
- \`::\` scope resolution: reach a global shadowed by a local, define a member outside the class, pick a base in multiple inheritance, or name a namespace member.
- **Storage classes** (\`auto\`, \`register\`, \`static\`, \`extern\`, \`mutable\`) define lifetime and visibility.
- \`std\` is the namespace holding the standard library; \`using namespace std;\` pulls it into global scope.` },
    { h: 'STL and the odd questions', md: `The **Standard Template Library** provides containers, algorithms, iterators and function objects. Know the contrast **array vs linked list**: arrays are contiguous, fixed-size and cache-friendly; lists are node-based, dynamic and spend memory on pointers.

Odd but recurring: a program *can* compile without \`main\` by using a macro that renames another function to main; **tokens** are keywords, identifiers, constants, strings, special symbols and operators; an **overflow error** happens when a value exceeds its type's range (int tops out at 2,147,483,647); **prefix** increments before use and **postfix** after, with opposite associativity.` },
  ],
  pitfalls: [
    'Saying a reference "is a pointer that cannot be null". Lead with alias semantics: it is another name for the same object, so no dereference syntax and no reseating.',
    'Claiming `new` is faster "because it is an operator" without mentioning the real difference: constructors run and the return type is exact.',
    'Mixing up overloading (compile time, same scope, different parameters) with overriding (run time, base/derived, same signature).',
    'Forgetting that a class with a pure virtual function cannot be instantiated, yet pointers and references to it are fine and are the whole point.',
    'Not mentioning the virtual destructor when asked about deleting through a base pointer.',
  ],
  model: [
    { q: 'What is the difference between a struct and a class in C++?', a: 'Members of a `struct` are public by default; members of a `class` are private by default. In C++ that is the only language-level difference, but conventionally a struct is used for passive data and a class for types with invariants and behaviour. (The source table also contrasts value vs reference and stack vs heap storage, which is how C# treats them; in C++ both can live anywhere.)', ref: 'cpp-8' },
    { q: 'Explain virtual functions and when a destructor should be virtual.', a: 'A virtual function is a base-class member that derived classes may override; calls through a base pointer dispatch to the most-derived override at run time via the vtable. A pure virtual function (`= 0`) has no base implementation and makes the class abstract. If a class is meant to be used polymorphically, its destructor must be virtual so that `delete basePtr` runs the derived destructor first and then the base destructor, freeing everything.', ref: 'cpp-27' },
    { q: 'Compare compile-time and run-time polymorphism.', a: 'Compile-time (static, early binding) polymorphism is resolved by the compiler through function and operator overloading; it is fast and does not involve inheritance. Run-time (dynamic, late binding) polymorphism is resolved during execution through virtual functions and overriding, which costs an indirect call but lets code work with objects whose exact type is unknown until run time.', ref: 'cpp-24' },
  ],
  quiz: [
    { type: 'mcq', q: 'Which statement about references is true?', options: ['A reference can be reseated to another variable later', 'A reference can hold a null value', 'A reference must be initialised and cannot be reassigned', 'A reference needs `->` to access members'], answer: 2, explain: 'A reference is an alias bound once at initialisation; it cannot be null or re-pointed, and it uses `.` to access members.', ref: 'cpp-9' },
    { type: 'mcq', q: 'What does `new` do that `malloc` does not?', options: ['Returns `void*`', 'Calls the constructor and returns the exact type', 'Allocates on the stack', 'Zero-fills memory'], answer: 1, explain: '`new` is an operator that allocates and constructs, returning a typed pointer; `malloc` just returns raw `void*` memory.', ref: 'cpp-14' },
    { type: 'mcq', q: 'A class containing at least one pure virtual function…', options: ['cannot have pointers to it', 'can be instantiated only once', 'cannot be instantiated but can be used as a base, pointer or reference type', 'must also be declared `final`'], answer: 2, explain: 'Such a class is abstract: no objects of it can be created, but it is exactly what you point to for run-time polymorphism.', ref: 'cpp-39' },
    { type: 'mcq', q: 'Which pair is an example of compile-time polymorphism?', options: ['Virtual functions and overriding', 'Function overloading and operator overloading', 'Templates and exceptions', 'Inheritance and encapsulation'], answer: 1, explain: 'Overloading is resolved by the compiler (static binding); virtual functions and overriding are resolved at run time.', ref: 'cpp-23' },
    { type: 'mcq', q: 'Why make a base-class destructor virtual?', options: ['To allow destructor overloading', 'So deleting through a base pointer also runs the derived destructor', 'To make the class abstract', 'To speed up object destruction'], answer: 1, explain: 'Without a virtual destructor, `delete base` runs only the base destructor and the derived part leaks.', ref: 'cpp-27' },
    { type: 'mcq', q: 'What is the default access of struct members versus class members?', options: ['Both private', 'struct public, class private', 'struct private, class public', 'Both public'], answer: 1, explain: 'That default is the real C++ difference between the two keywords.', ref: 'cpp-8' },
    { type: 'mcq', q: 'Which keyword lets a member change inside a `const` member function?', options: ['volatile', 'static', 'mutable', 'inline'], answer: 2, explain: '`mutable` exempts a data member from the constness of the object.', ref: 'cpp-43' },
    { type: 'mcq', q: 'Can an inline function be recursive?', options: ['Yes, always', 'No; inlining pastes the body at the call site and recursion needs a stack frame, so the compiler ignores the hint', 'Only with `constexpr`', 'Only in templates'], answer: 1, explain: '`inline` is a suggestion; recursive functions cannot be fully inlined.', ref: 'cpp-38' },
    { type: 'short', q: 'Define function overriding and name the kind of polymorphism it gives you.', a: 'Overriding is redefining, in a derived class, a function that already exists in the base class with the same name, parameters and return type. Combined with `virtual` it gives run-time (late-binding) polymorphism: the version executed depends on the dynamic type of the object.', ref: 'cpp-17' },
    { type: 'short', q: 'What are the three access modifiers and who can use each?', a: '`private`: only the class itself (and friends). `protected`: the class and classes derived from it. `public`: any code. Structs default to public, classes to private.', ref: 'cpp-35' },
    { type: 'short', q: 'Contrast shallow and deep copy.', a: 'A shallow copy duplicates the object field by field, so pointer members still point to the same shared data; it is fast but two objects now share state. A deep copy also duplicates everything the pointers refer to, so each object owns its own data; it is slower but safe. Classes owning raw resources need a deep-copying copy constructor and assignment operator.', ref: 'cpp-48' },
  ],
  cards: [
    { f: 'Reference vs pointer: three differences', b: 'Reference: must be initialised, cannot be null, cannot be reseated, uses `.`. Pointer: may be null, can be reassigned, supports arithmetic, uses `->`/`*`.', ref: 'cpp-9' },
    { f: 'new vs malloc', b: '`new`: operator, calls constructor, returns exact type. `malloc`: function, no constructor, returns `void*`.', ref: 'cpp-14' },
    { f: 'delete vs delete[]', b: '`delete` for a single object from `new`; `delete[]` for an array from `new[]`, running every destructor.', ref: 'cpp-31' },
    { f: 'Virtual vs pure virtual function', b: 'Virtual: defined in base, may be overridden; class is concrete. Pure virtual (`= 0`): no base definition; class becomes abstract.', ref: 'cpp-15' },
    { f: 'Compile-time vs run-time polymorphism', b: 'Compile-time: overloading (function/operator), static binding, fast. Run-time: virtual functions and overriding, dynamic binding via vtable.', ref: 'cpp-24' },
    { f: 'Three kinds of constructor', b: 'Default (no args), parameterised (args, enables overloading), copy (takes a reference to the same class).', ref: 'cpp-25' },
    { f: 'Why a virtual destructor?', b: 'Deleting a derived object through a base pointer must run the derived destructor first, then the base; otherwise the derived part leaks.', ref: 'cpp-27' },
    { f: 'volatile', b: 'The value may change outside the program\'s control (hardware, signal handler); the compiler must not cache or optimise reads away.', ref: 'cpp-41' },
    { f: 'Scope resolution operator ::', b: 'Access a shadowed global, define a member function outside its class, disambiguate in multiple inheritance, qualify a namespace member.', ref: 'cpp-34' },
    { f: 'Friend function', b: 'A non-member (global) function granted access to a class\'s private and protected members by a `friend` declaration inside the class.', ref: 'cpp-32' },
    { f: 'Static data member', b: 'One shared copy for all objects, zero-initialised before main; accessed via `ClassName::member`.', ref: 'cpp-40' },
    { f: 'Array vs linked list', b: 'Array: contiguous, fixed size, less memory, O(1) index. List: nodes linked by pointers, dynamic size, extra memory per node.', ref: 'cpp-11' },
  ],
});
