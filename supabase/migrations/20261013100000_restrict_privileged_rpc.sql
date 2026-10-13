-- Close unauthenticated execution of privileged RPCs. Trigger functions remain usable by triggers.
revoke execute on function public.ballersplay_complete_player_profile(text,text) from public,anon;
revoke execute on function public.ballersplay_confirm_booking(uuid) from public,anon;
revoke execute on function public.ballersplay_create_player_profile() from public,anon;
revoke execute on function public.ballersplay_find_player(text) from public,anon;
revoke execute on function public.ballersplay_profile_stats(uuid) from public,anon;
revoke execute on function public.ballersplay_queue_booking_email() from public,anon;
revoke execute on function public.ballersplay_review_candidates() from public,anon;
revoke execute on function public.ballersplay_set_username(text) from public,anon;
revoke execute on function public.ballersplay_submit_review(uuid,uuid,integer,text) from public,anon;
revoke execute on function public.is_ballersplay_admin() from public,anon;
grant execute on function public.ballersplay_complete_player_profile(text,text) to authenticated;
grant execute on function public.ballersplay_find_player(text) to authenticated;
grant execute on function public.ballersplay_profile_stats(uuid) to authenticated;
grant execute on function public.ballersplay_review_candidates() to authenticated;
grant execute on function public.ballersplay_set_username(text) to authenticated;
grant execute on function public.ballersplay_submit_review(uuid,uuid,integer,text) to authenticated;
