export async function fetchTransactionData() {
  try {
    const response = await fetch(
      "https://caerfi-solver.vercel.app/api/borrow"
      // "http://localhost:4000/api/borrow"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch transaction data");
    }
    const data = await response.json();
    return { data: data.data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
