import supabase from "./supbase";

export async function savePlayer(name, score, email) {
  // Check if player exists
  const { data: existingPlayer, error: fetchError } = await supabase
    .from("players")
    .select("*")
    .eq("name", name)
    .eq("email", email)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error checking player:", fetchError);
    return null;
  }

  if (existingPlayer) {
    // Update score if new score is higher
    if (score > existingPlayer.score) {
      const { data, error } = await supabase
        .from("players")
        .update({ score })
        .eq("id", existingPlayer.id);

      if (error) {
        console.error("Error updating score:", error);
        return null;
      }
      return data;
    } else {
      // New score is not higher, do nothing
      return existingPlayer;
    }
  } else {
    // Insert new player
    const { data, error } = await supabase
      .from("players")
      .insert([{ name, score, email }]);

    if (error) {
      console.error("Error saving player:", error);
      return null;
    }
    return data;
  }
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

  // Filter out duplicates, keeping only the highest score for each unique user (email)
  // Since data is ordered by score descending, the first occurrence is the highest score
  const uniquePlayers = [];
  const seenEmails = new Set();

  for (const player of data) {
    // Use email as unique identifier if available, otherwise fallback to name
    const identifier = player.email || player.name;

    if (!seenEmails.has(identifier)) {
      seenEmails.add(identifier);
      uniquePlayers.push(player);
    }
  }

  return uniquePlayers;
}
