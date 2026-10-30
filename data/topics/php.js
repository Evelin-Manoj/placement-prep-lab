window.registerTopic('php', {
  why: `PHP still powers a large share of the web, so service companies and agencies keep a PHP section in the technical round even for JavaScript-leaning candidates. Interviewers test the **language rules** (case sensitivity, variable naming, truthiness, single vs double quotes), **request handling** (GET vs POST, sessions vs cookies), **file inclusion** (include vs require vs require_once), **OOP features** (constructors, final, magic methods, type hinting) and **functional pieces** (callbacks, closures, array functions).

Most answers are factual; precision wins.`,
  notes: [
    { h: 'Language basics', md: `PHP is a server-side scripting language. Code lives between \`<?php … ?>\` (the short \`<? ?>\` form depends on configuration). Run a script from the command line with \`php script.php\`. **Escaping to PHP** is how the parser tells PHP code apart from HTML. PHP is **partially case-sensitive**: variable names are case-sensitive, function and class names are not. **Static** sites serve fixed content; **dynamic** sites regenerate content per request. **PEAR** (PHP Extension and Application Repository) is a framework and repository of reusable components with a CLI installer. Popular frameworks: Laravel (not in the bank), CakePHP, CodeIgniter, Yii 2, Symfony, Zend.` },
    { h: 'Variables, constants and types', md: `Variables start with \`$\`, need no declaration, have no intrinsic type and hold their most recent assignment. Names begin with a letter or underscore and may contain letters, digits and underscores. **Constants** are defined with \`define("NAME", value)\` (or \`const\`), have no \`$\`, cannot be changed or undefined, ignore scope, and are read back by name or with \`constant("NAME")\` when the name is dynamic. Magic constants: \`__LINE__\`, \`__FILE__\`, \`__FUNCTION__\`, \`__CLASS__\`, \`__METHOD__\`.

Types: scalar (int, float, bool, string), compound (array, object, callable), special (resource, NULL). \`NULL\` is a case-insensitive constant with one value; a NULL variable is falsy and \`isset()\` returns false for it. **Truthiness**: numbers are false only when exactly 0; strings are false when empty or exactly "0"; NULL is false; arrays are false when empty; valid resources are true; never use floats as booleans.

Arrays: **indexed** (numeric keys), **associative** (string keys), **multidimensional** (arrays of arrays). \`foreach ($array as $value)\` and \`foreach ($array as $key => $value)\` iterate them. \`$$message\` is a **variable variable**: a variable whose name is the value of \`$message\`.` },
    { h: 'Strings and output', md: `**Single-quoted** strings are literal; **double-quoted** strings interpolate variables and interpret escapes like \`\\n\`. Concatenate with the dot operator \`.\`. \`echo\` outputs one or more strings and returns nothing (slightly faster); \`print\` outputs one string and always returns 1. Both are language constructs, not functions. \`set_time_limit(0)\` removes the execution time limit (also configurable in php.ini). \`break\` exits a loop or switch; \`continue\` skips to the next iteration. Legacy string functions in the bank: \`ereg\`, \`split\` (removed), \`preg_match\` and \`preg_split\` (regex, current).` },
    { h: 'Includes and errors', md: `\`include\` pulls in a file and only warns if it is missing, continuing execution; \`require\` raises a fatal error and stops. \`require_once\`/\`include_once\` include the file only if it has not been included already, which is right for files full of function or class definitions.

Error levels: \`E_ERROR\` (fatal), \`E_WARNING\`, \`E_PARSE\` (compile-time), \`E_NOTICE\`, \`E_CORE_ERROR\`/\`E_CORE_WARNING\` (startup), \`E_COMPILE_ERROR\`, \`E_USER_*\` (raised by your code), \`E_STRICT\`, \`E_RECOVERABLE_ERROR\`, \`E_ALL\`. The bank's last question maps Java terminology onto PHP: checked (compile-time) exceptions must be handled; unchecked (runtime) exceptions may be left to propagate.` },
    { h: 'Requests, sessions and cookies', md: `**GET** appends encoded data to the URL after \`?\` (name=value pairs joined by \`&\`), is limited to roughly 1024–2048 characters, cannot carry binary data, is visible and bookmarkable, and is read from \`$_GET\`. **POST** sends data in the HTTP body, has no size limit in principle, can carry binary data, and is read from \`$_POST\`. A **session** is server-side storage keyed by a unique id (usually carried in a cookie), can hold large data and ends when the browser closes or on timeout; a **cookie** is stored in the browser and sent with each request. PHP generates HTML (and even JavaScript) on the server; JavaScript runs in the browser, so they exchange data through the URL, forms or AJAX rather than directly. **cURL** (client URL) fetches remote URLs with headers and content. \`crypt()\` creates one-way hashes (use \`password_hash\` today).` },
    { h: 'OOP: constructors, final, magic methods, type hints', md: `PHP 5 introduced \`__construct\`/\`__destruct\` (PHP 4 used class-named constructors), objects passed by handle, abstract classes and static members. \`==\` on objects is true when they are the same class with equal attributes; \`===\` is true only for the same instance. **final** methods cannot be overridden and final classes cannot be extended; properties cannot be final. **Overloading** in PHP is done through the magic method \`__call\` (and \`__get\`/\`__set\`), while **overriding** redefines a parent method in a child.

**Magic methods** start with \`__\`: \`__construct\`, \`__destruct\`, \`__call\`, \`__get\`, \`__set\`, \`__isset\`, \`__unset\`, \`__sleep\`, \`__wakeup\`, \`__toString\`, \`__invoke\`, \`__set_state\`, \`__clone\`, \`__debugInfo\`. **Type hinting** declares the expected parameter type (\`function sendEmail(Email $email)\`) and PHP raises an error when the argument does not match.

\`\`\`php
class Foo {
  private $name;
  public function __construct($name) { $this->name = $name; }
  public function __destruct() { echo 'Destroying: ', $this->name, PHP_EOL; }
}
\`\`\`` },
    { h: 'Callbacks and closures', md: `A **callback** is a function passed to another function, used by \`array_map\`, \`usort\`, \`preg_replace_callback\`; pass it as a string name or a callable. A **lambda** is an anonymous function stored in a variable or passed inline; a **closure** is a lambda that captures variables from its surrounding scope with \`use\`:

\`\`\`php
$min = 2;
$output = array_filter([1, 2, 3, 4, 5], function ($v) use ($min) { return $v > $min; });
\`\`\`

Connecting to MySQL: open a connection, build the SQL string (CREATE DATABASE …), execute it, check the result.` },
  ],
  pitfalls: [
    'Saying PHP is case-sensitive or case-insensitive without the nuance: variables are, functions and classes are not.',
    'Forgetting that the string "0" is falsy while "0.0" and " " are truthy.',
    'Using include for critical files; require stops execution when the file is missing, which is what you want.',
    'Treating sessions and cookies as the same thing: sessions live on the server, cookies in the browser.',
    'Suggesting crypt() or md5 for passwords; mention password_hash/password_verify.',
  ],
  model: [
    { q: 'What is the difference between include and require?', a: 'Both insert and evaluate another PHP file. If the file is missing, include emits a warning and the script continues, while require emits a fatal error and stops. The `_once` variants skip the file if it was already included, which prevents redeclaration errors for files that define functions or classes. Use require for dependencies the script cannot run without.', ref: 'php-26' },
    { q: 'Compare GET and POST in PHP.', a: 'GET sends data in the URL after a question mark, so it is visible, bookmarkable, limited in length and unsuitable for binary or sensitive data; PHP exposes it in `$_GET`. POST sends data in the request body, has no practical size limit, supports binary uploads and is read from `$_POST`. Use GET for idempotent reads and POST for actions that change state.', ref: 'php-43' },
    { q: 'What are magic methods?', a: 'Methods whose names begin with a double underscore that PHP calls automatically at certain moments: `__construct` and `__destruct` for object lifecycle, `__get`/`__set`/`__isset`/`__unset` for inaccessible properties, `__call`/`__callStatic` for undefined methods (the basis of overloading in PHP), `__toString` for string conversion, `__invoke` for calling an object, `__clone`, `__sleep`/`__wakeup` for serialisation and `__debugInfo` for var_dump.', ref: 'php-46' },
  ],
  quiz: [
    { type: 'mcq', q: 'Which of these is case-sensitive in PHP?', options: ['Function names', 'Class names', 'Variable names', 'Keywords'], answer: 2, explain: 'Variables are case-sensitive; functions, classes and keywords are not.', ref: 'php-5' },
    { type: 'mcq', q: 'Which value is truthy?', options: ['"0"', '0.0', '"0.0"', 'An empty array'], answer: 2, explain: 'Only the exact string "0" and the empty string are falsy strings; "0.0" is truthy.', ref: 'php-10' },
    { type: 'mcq', q: 'What happens when `require` cannot find the file?', options: ['A warning, execution continues', 'A fatal error, execution stops', 'Nothing', 'The file is created'], answer: 1, explain: 'include only warns; require is fatal.', ref: 'php-26' },
    { type: 'mcq', q: 'Which superglobal holds data sent in the URL query string?', options: ['$_POST', '$_GET', '$_SESSION', '$_FILES'], answer: 1, explain: 'GET parameters appear after ? in the URL and land in $_GET.', ref: 'php-42' },
    { type: 'mcq', q: 'How do you print a variable inside a string literal?', options: ["'My $var'", '"My $var"', 'Both work', 'Neither; use echo $var only'], answer: 1, explain: 'Double quotes interpolate; single quotes are literal.', ref: 'php-31' },
    { type: 'mcq', q: 'What does `$$message` mean?', options: ['A static variable', 'A variable whose name is the value of $message', 'A constant', 'A syntax error'], answer: 1, explain: 'If $message is "var", $$message is $var.', ref: 'php-40' },
    { type: 'mcq', q: 'What does `final` on a method do?', options: ['Makes it static', 'Prevents subclasses from overriding it', 'Makes it private', 'Runs it last'], answer: 1, explain: 'final classes cannot be extended; final methods cannot be overridden; properties cannot be final.', ref: 'php-19' },
    { type: 'mcq', q: 'Which operator tests whether two variables refer to the same object instance?', options: ['==', '===', '=', 'equals()'], answer: 1, explain: '== compares class and attribute values; === is identity.', ref: 'php-20' },
    { type: 'mcq', q: 'How does `echo` differ from `print`?', options: ['echo returns 1, print returns nothing', 'print can take multiple arguments', 'echo can output several strings and returns nothing; print outputs one and returns 1', 'They are identical'], answer: 2, explain: 'Both are language constructs; echo is marginally faster.', ref: 'php-34' },
    { type: 'short', q: 'Where is a session stored and how is it linked to the user?', a: 'Session data lives on the server; PHP generates a unique session id and sends it to the browser (normally in a cookie, PHPSESSID), which returns it on each request so PHP can load the matching data. Sessions can hold more data than cookies and end on timeout or when the browser closes.', ref: 'php-37' },
    { type: 'short', q: 'What is type hinting?', a: 'Declaring the expected type of a function parameter (`function send(Email $email)` or scalar types like `int`). PHP checks the argument when the function is called and throws a TypeError if it does not match, catching bugs early and documenting the API.', ref: 'php-49' },
    { type: 'short', q: 'What is a closure in PHP and how does it capture variables?', a: 'An anonymous function assigned to a variable or passed as an argument. Unlike JavaScript, PHP closures must list captured outer variables explicitly with `use ($var)`, by value unless written `use (&$var)`.', ref: 'php-45' },
  ],
  cards: [
    { f: 'PHP case sensitivity', b: 'Variables: case-sensitive. Functions, classes, keywords: case-insensitive.', ref: 'php-5' },
    { f: 'Falsy values', b: '0, 0.0, "", "0", NULL, empty array, unset variable. "0.0" and " " are truthy.', ref: 'php-10' },
    { f: 'Constants', b: 'define("NAME", v) or const; no $; cannot change; ignore scope; constant("NAME") for dynamic lookup.', ref: 'php-12' },
    { f: 'Magic constants', b: '__LINE__, __FILE__, __FUNCTION__, __CLASS__, __METHOD__.', ref: 'php-15' },
    { f: 'include vs require vs require_once', b: 'include warns and continues; require is fatal; _once skips files already included.', ref: 'php-27' },
    { f: 'Single vs double quotes', b: 'Single: literal. Double: interpolates $vars and escapes like \\n.', ref: 'php-31' },
    { f: 'echo vs print', b: 'echo: many args, no return, faster. print: one arg, returns 1.', ref: 'php-34' },
    { f: 'GET vs POST', b: 'GET: URL, ~1–2 KB, no binary, $_GET. POST: body, unlimited, binary ok, $_POST.', ref: 'php-43' },
    { f: 'Session vs cookie', b: 'Session: server-side, id in cookie, larger. Cookie: browser-side, sent each request.', ref: 'php-37' },
    { f: 'Magic methods', b: '__construct __destruct __call __get __set __isset __unset __toString __invoke __clone __sleep __wakeup __set_state __debugInfo', ref: 'php-46' },
    { f: 'Overloading in PHP', b: 'Done via __call (methods) and __get/__set (properties); overriding redefines a parent method.', ref: 'php-38' },
    { f: 'Closure capture', b: 'Anonymous function with `use ($x)` (by value) or `use (&$x)` (by reference).', ref: 'php-45' },
    { f: 'Array types', b: 'Indexed (numeric keys), associative (string keys), multidimensional.', ref: 'php-30' },
    { f: 'Type hinting', b: 'Declare parameter types; mismatched arguments throw TypeError.', ref: 'php-49' },
  ],
  coding: [
    { id: 'foreach-assoc', title: 'Iterate an associative array', prompt: 'Write a foreach that prints "key => value" for each pair of `$prices = ["tea" => 20, "coffee" => 40]`. Then the JS equivalent runs here.', starter: '// PHP:\n// foreach ($prices as $k => $v) { ... }\n\n// JS equivalent:\nconst prices = { tea: 20, coffee: 40 };\nfor (const [k, v] of Object.entries(prices)) console.log(`${k} => ${v}`);', solution: '<?php\n$prices = ["tea" => 20, "coffee" => 40];\nforeach ($prices as $k => $v) {\n  echo "$k => $v\\n";\n}', ref: 'php-29' },
    { id: 'filter-closure', title: 'array_filter with a closure that captures a variable', prompt: 'Keep only values greater than `$min` using array_filter and a closure with `use`.', starter: '// PHP:\n// $min = 2; $input = [1,2,3,4,5];\n// $output = array_filter($input, function ($v) use ($min) { ... });\n\n// JS equivalent:\nconst min = 2; console.log([1,2,3,4,5].filter(v => v > min));', solution: '<?php\n$min = 2;\n$input = [1, 2, 3, 4, 5];\n$output = array_filter($input, function ($v) use ($min) { return $v > $min; });\nprint_r(array_values($output)); // [3, 4, 5]', notes: 'array_filter preserves keys; wrap in array_values to reindex.', ref: 'php-45' },
    { id: 'magic', title: 'A class with __construct, __toString and __get', prompt: 'Write a `User` class whose constructor stores a name, `__toString` returns it, and `__get` returns "unknown" for undefined properties.', starter: '// PHP sketch:\n// class User { private $name; ... }\nconsole.log("write it, then reveal");', solution: '<?php\nclass User {\n  private $name;\n  public function __construct(string $name) { $this->name = $name; }\n  public function __toString(): string { return $this->name; }\n  public function __get($prop) { return "unknown"; }\n}\n$u = new User("Evelin");\necho $u, " ", $u->age; // Evelin unknown', ref: 'php-46' },
  ],
});
