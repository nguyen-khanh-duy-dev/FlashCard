import { supabase } from './supabase'
import { endOfToday, schedule, todayWords } from './srs'

function check({ data, error }) {
  if (error) throw error
  return data
}

export async function listDecks() {
  const decks = check(await supabase.from('decks').select('*').order('created_at', { ascending: false }))
  const cards = check(
    await supabase
      .from('cards')
      .select('id, deck_id, term, definition, due_at, interval_days, last_reviewed_at, learned_at, created_at')
  )
  return { decks, cards }
}

// Các từ của hôm nay chưa nắm được (để học trong phiên /today)
export async function todayCards() {
  const decks = check(await supabase.from('decks').select('id, name'))
  const cards = check(await supabase.from('cards').select('*'))
  return todayWords(decks, cards).words.filter((c) => !(c.interval_days >= 1))
}

export async function getDeck(id) {
  return check(await supabase.from('decks').select('*').eq('id', id).single())
}

export async function createDeck(name, description = '') {
  return check(await supabase.from('decks').insert({ name, description }).select().single())
}

export async function updateDeck(id, patch) {
  return check(await supabase.from('decks').update(patch).eq('id', id).select().single())
}

export async function deleteDeck(id) {
  check(await supabase.from('decks').delete().eq('id', id))
}

export async function listCards(deckId) {
  return check(await supabase.from('cards').select('*').eq('deck_id', deckId).order('created_at', { ascending: true }))
}

export async function addCards(deckId, items) {
  const rows = items.map((c) => ({
    deck_id: deckId,
    term: c.term.trim(),
    definition: c.definition.trim(),
    example: c.example?.trim() || null,
  }))
  return check(await supabase.from('cards').insert(rows).select())
}

export async function updateCard(id, patch) {
  return check(await supabase.from('cards').update(patch).eq('id', id).select().single())
}

export async function deleteCard(id) {
  check(await supabase.from('cards').delete().eq('id', id))
}

// deckId = null → tất cả các bộ
export async function dueCards(deckId) {
  let q = supabase.from('cards').select('*').lte('due_at', endOfToday().toISOString()).order('due_at')
  if (deckId) q = q.eq('deck_id', deckId)
  return check(await q)
}

export async function reviewCard(card, grade) {
  const patch = schedule(card, grade)
  return updateCard(card.id, patch)
}
