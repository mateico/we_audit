export async function ejecutarConLimite<T>(
  items: T[],
  limite: number,
  tarea: (item: T) => Promise<void>,
): Promise<void> {
  const cola = [...items];

  async function trabajador() {
    let item: T | undefined;
    while ((item = cola.shift()) !== undefined) {
      await tarea(item);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limite, items.length) }, trabajador),
  );
}
