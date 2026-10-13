# arrow-frame-ts

<kbd>
I don't know what I am doing. I don't know what I want with this repo. I am tired of AI tech news, AI podcasts, AI agile "ted talks", AI coding, AI code reviews, and VSCode AI agent updates. Tired of how the industry keeps telling us  devs how we will not exist soon.
</kbd>

<div>&nbsp;</div>

<kbd>I don’t want AI to think for me; I want to think; so I will tinker.</kbd>

### Status

<kbd>Experimenting.</kbd>

### Problem space

![Description](web/src/assets/docs/problem-space.svg)

<kbd>
Fetching columnar data from a backend and using it in the browser for data analysis is just the tip of the iceberg (<a href="https://iceberg.apache.org/">pun intended</a>).
</kbd>

<div>&nbsp;</div>

<kbd>
Things get more interesting when the frontend needs to create new columns from existing data, without creating them upfront, and avoiding recalculations when the component states they depend on haven't changed.
</kbd>

### Open questions

#### Caching and memorization

<kbd>What should the cache store, and how should deferred computations be evaluated?</kbd>

#### Reactivity and invalidation

<kbd>How can external reactive values, like Vue refs, tell the frame that a computation has changed?</kbd>

#### Dependency tracking

<kbd>How should the frame know which columns and external reactive values a computation depends on?</kbd>
