import { createServer, createClient } from "bedrock-protocol";

const LISTEN_PORT = 19132;
const REMOTE_HOST = "127.0.0.1";
const REMOTE_PORT = 19131;
const REMOTE_VERSION = "1.21.100";

const forwardedPackets = [
  "start_game",
  "login",
  "authentication",
  "login_success",
  "play_status",
  "resource_packs_info",
  "resource_pack_stack",
  "resource_pack_client_response", // クライアント側レスポンス忘れがち
  "chunk_radius_update",
  "level_chunk",
  "set_time",
  "text",
  "add_player",
  "add_actor",
  "move_player",
  "tick_sync",
  "request_chunk_radius",
  "network_chunk_publisher_update",
  "level_event_generic",
  "network_settings",
  "request_network_settings",
  "req_network_settings",
  "set_local_player_as_initialized",
  "client_cache_status",
  "disconnect",
  "server_to_client_handshake",
  "client_to_server_handshake",
  "bedrock_packet_ids",
  "types",
  "serializer",
  "add_entity",
  "remove_entity",
  "add_item_entity",
  "add_hanging_entity",
  "take_item_entity",
  "move_entity",
  "rider_jump",
  "update_block",
  "add_painting",
  "explode",
  "sound_event",
  "space_event",
  "block_event",
  "entity_event",
  "mob_effect",
  "update_attributes",
  "inventory_transaction",
  "mob_equipment",
  "mob_armor_equipment",
  "interact",
  "block_pick_request",
  "entity_pick_request",
  "player_action",
  "entity_fall",
  "hurt_armor",
  "set_entity_data",
  "set_entity_motion",
  "set_entity_link",
  "set_health",
  "set_spawn_position",
  "animate",
  "respawn",
  "container_open",
  "container_close",
  "player_hotbar",
  "inventory_content",
  "inventory_slot",
  "container_set_data",
  "crafting_data",
  "crafting_event",
  "gui_data_pick_item",
  "adventure_settings",
  "block_entity_data",
  "player_input",
  "full_chunk_data",
  "set_commands_enabled",
  "set_difficulty",
  "change_dimension",
  "set_player_game_type",
  "player_list",
  "simple_event",
  "event",
  "spawn_experience_orb",
  "clientbound_map_item_data",
  "map_info_request",
  "item_frame_drop_item",
  "game_rules_changed",
  "camera",
  "boss_event",
  "show_credits",
  "available_commands",
  "command_request",
  "command_block_update",
  "command_output",
  "update_trade",
  "update_equip",
  "resource_pack_data_info",
  "resource_pack_chunk_data",
  "resource_pack_chunk_request",
  "transfer",
  "play_sound",
  "stop_sound",
  "set_title",
  "add_behavior_tree",
  "structure_block_update",
  "show_store_offer",
  "purchase_receipt",
  "player_skin",
  "sub_client_login",
  "w_s_connect",
  "set_last_hurt_by",
  "book_edit",
  "npc_request",
  "photo_transfer",
  "modal_form_request",
  "modal_form_response",
  "server_settings_request",
  "server_settings_response",
  "show_profile",
  "set_default_game_type",
  "animate_entity",
  "available_actor_identifiers",
  "biome_definition_list",
  "block_update", // 既に"update_block"があるが、念のため明示
  "chunk_radius_updated",
  "client_cache_blob_status",
  "client_cache_miss_response",
  "client_disconnect",
  "client_join",
  "client_login",
  "client_login_failure",
  "client_login_success",
  "client_resource_packs_completed",
  "client_resource_packs_refused",
  "client_text",
  "code_builder",
  "creative_content",
  "emote_list",
  "entity_add",
  "entity_moved_absolute",
  "entity_remove",
  "filter_text",
  "hurt_armour", // (既に "hurt_armor" があるがスペル違いに注意)
  "item_add",
  "item_component",
  "item_pickup",
  "item_stack_request",
  "item_stack_response",
  "item_take",
  "lab_table",
  "lectern_update",
  "level_event",
  "level_sound_event",
  "map_create_locked_copy",
  "map_item_data",
  "move_entity_delta",
  "network_stack_latency",
  "on_screen_texture_animation",
  "packet_received",
  "packet_sent",
  "packet_violation_warning",
  "painting_add",
  "player_add",
  "player_armor_damage",
  "player_auth_input",
  "player_enchant_options",
  "player_moved",
  "position_tracking_db_client_request",
  "position_tracking_db_server_broadcast",
  "remove_objective",
  "script_custom_event",
  "server_start",
  "set_display_objective",
  "set_score",
  "set_scoreboard_identity",
  "slash_command",
  "spawn_particle_effect",
  "structure_template_data_export_request",
  "structure_template_data_export_response",
  "tick",
  "time_sync",
  "update_block_properties",
  "update_block_synced",
  "update_player_game_type",
  "update_soft_enum",
  "video_stream_connect",
];

createServer({
  host: "0.0.0.0",
  port: LISTEN_PORT,
  offline: false,
  version: REMOTE_VERSION,
}).on("connect", (client) => {
  console.log("[DEBUG] Client connected:", client.username);

  const server = createClient({
    host: REMOTE_HOST,
    port: REMOTE_PORT,
    username: "LoggerBot",
    offline: false,
    version: REMOTE_VERSION,
  });

  server.on("packet", ({ name, params }) => {
    if (!name) {
      // console.warn("[S → C] ⚠️ Unknown packet from server", params);
    } else {
      console.log(`[S → C] [${name}]`);
      client.queue(name, params);
    }
  });

  // 双方向パケット中継
  forwardedPackets.forEach((packetName) => {
    server.on(packetName, (packet) => {
      console.log(`[S → C] [${packetName}]`);
      if (packetName === "start_game" || packetName === "play_status") {
        console.dir(packet, { depth: null });
      }
      client.queue(packetName, packet);
    });
  });

  client.on("packet", ({ name, params }) => {
    if (!["text"].includes(name)) {
      // 'text' は既に個別に処理中
      console.log(`[C → S] [${name}]`);
      server.queue(name, params);
    }
  });

  client.on("text", (packet) => {
    console.log(`[C → S] <${client.username}> ${packet.message}`);
    try {
      server.queue("text", JSON.parse(JSON.stringify(packet)));
    } catch (e) {
      console.error("[FATAL] Failed to forward packet:", e);
    }
  });

  // 双方の切断処理
  const closeBoth = () => {
    client.close();
    server.close();
    console.log("[DEBUG] Both connections closed.");
  };

  client.on("disconnect", closeBoth);
  server.on("disconnect", closeBoth);

  server.on("error", (err) => {
    console.error("[ERROR] Server:", err);
    client.disconnect("Remote server error.");
  });
});
