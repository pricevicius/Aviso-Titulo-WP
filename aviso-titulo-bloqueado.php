<?php
/*
Plugin Name: Aviso de termos no título
Description: Alerta informativo para termos configurados no título de posts. Não bloqueia publicação.
Version: 1.3.0
Author: Equipe do site
License: GPL-2.0+
*/

if (!defined('ABSPATH')) {
    exit;
}

define('ATB_OPTION', 'atb_termos');
define('ATB_VERSION', '1.1.0');

function atb_get_terms() {
    $value = get_option(ATB_OPTION, '');
    $lines = preg_split('/[\r\n,;]+/', $value);
    $terms = array();

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line !== '' && !in_array($line, $terms)) {
            $terms[] = $line;
        }
    }

    return $terms;
}


function atb_add_options_page() {
    add_options_page(
        'Aviso de termos no título',
        'Aviso no título',
        'manage_options',
        'atb-title-warning',
        'atb_render_options_page'
    );
}
add_action('admin_menu', 'atb_add_options_page');


function atb_register_settings() {
    register_setting(
        'atb_settings_group',
        ATB_OPTION,
        'atb_sanitize_terms'
    );
}
add_action('admin_init', 'atb_register_settings');


function atb_sanitize_terms($value) {
    $value = str_replace(array("\r\n", "\r"), "\n", $value);
    $lines = preg_split('/[\r\n,;]+/', $value);
    $terms = array();

    foreach ($lines as $line) {
        $line = trim(wp_strip_all_tags($line));

        if ($line !== '' && !in_array($line, $terms)) {
            $terms[] = $line;
        }
    }

    return implode("\n", $terms);
}


function atb_render_options_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Você não tem permissão para acessar esta página.');
    }
    ?>
    <div class="wrap">
        <h1>Aviso de termos no título</h1>

        <p>
            Informe uma palavra ou expressão por linha. O aviso é apenas
            informativo e não impede salvar, agendar ou publicar.
        </p>

        <form method="post" action="options.php">
            <?php settings_fields('atb_settings_group'); ?>

            <textarea
                name="<?php echo esc_attr(ATB_OPTION); ?>"
                rows="16"
                cols="60"
                class="large-text code"><?php echo esc_html(get_option(ATB_OPTION, '')); ?></textarea>

            <p class="description">
                Exemplo: <code>urgente</code> ou
                <code>nome de uma pessoa</code>.
            </p>

            <?php submit_button('Salvar lista'); ?>
        </form>
    </div>
    <?php
}
function atb_admin_enqueue($hook) {
    $terms = atb_get_terms();

    if ($hook !== 'post.php' && $hook !== 'post-new.php') {
        return;
    }

    if (empty($terms)) {
        return;
    }

    wp_enqueue_script(
        'atb-title-warning',
        plugins_url('assets/title-warning.js', __FILE__),
        array('jquery'),
        ATB_VERSION
    );

    wp_localize_script(
        'atb-title-warning',
        'atbTitleWarning',
        array(
            'terms' => $terms,
            'singular' => 'Aviso informativo: o termo "%s" consta na lista de bloqueio.',
            'plural' => 'Aviso informativo: os termos %s constam na lista de bloqueio.'
        )
    );
}
add_action('admin_enqueue_scripts', 'atb_admin_enqueue');