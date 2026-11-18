export default function HomePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-pizza-red/20 bg-pizza-red/10 px-4 py-1.5 text-sm font-medium text-pizza-red">
        🍕 Multi-Vendor Artisanal Platform
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
        Welcome to <span className="text-pizza-red">PizzaHub</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        The ultimate marketplace connecting passionate pizza lovers with top independent pizzerias and master pizzaiolos.
      </p>
    </main>
  );
}
