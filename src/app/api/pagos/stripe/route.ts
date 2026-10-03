import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { monto, noches } = await request.json();

    // Simulación de validación exitosa estilo Stripe
    if (!monto || !noches) {
      return NextResponse.json(
        { error: "Monto y noches son requeridos" },
        { status: 400 }
      );
    }

    // Retornamos un client_secret ficticio
    return NextResponse.json(
      {
        client_secret: `pi_stripe_sim_secret_${Date.now()}`,
        status: "succeeded",
        monto,
        noches
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error procesando el pago" },
      { status: 500 }
    );
  }
}
