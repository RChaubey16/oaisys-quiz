import supabase from "./supbase";

export async function savePlayer(name, score, email) {
  const { data, error } = await supabase
    .from("players")
    .insert([{ name, score, email }]);

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function loadPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("score", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
