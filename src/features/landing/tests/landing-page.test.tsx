import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { LandingPage } from "../components/landing-page";

describe("LandingPage", () => {
  it("apresenta as seções principais com headings semânticos", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Vender e comprar localmente costumava ser complicado",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Construído com tecnologia de classe mundial",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Simples do primeiro clique até a entrega",
      }),
    ).toBeInTheDocument();
  });

  it("oferece navegação por âncoras e CTAs de cadastro", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(nav.querySelector('a[href="#como-funciona"]')).not.toBeNull();

    const signupLinks = screen.getAllByRole("link", {
      name: /Quero anunciar/i,
    });
    expect(signupLinks.length).toBeGreaterThan(0);
    expect(signupLinks[0]).toHaveAttribute("href", "/register");
  });
});
