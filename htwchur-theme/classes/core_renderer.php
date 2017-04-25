<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

require_once($CFG->dirroot . '/theme/bootstrapbase/renderers.php');

/**
 * htwchur core renderers.
 *
 * @package    theme_htwchur
 * @copyright  2015 Frédéric Massart - FMCorz.net
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class theme_htwchur_core_renderer extends theme_bootstrapbase_core_renderer {

    /**
     * Either returns the parent version of the header bar, or a version with the logo replacing the header.
     *
     * @since Moodle 2.9
     * @param array $headerinfo An array of header information, dependant on what type of header is being displayed. The following
     *                          array example is user specific.
     *                          heading => Override the page heading.
     *                          user => User object.
     *                          usercontext => user context.
     * @param int $headinglevel What level the 'h' tag will be.
     * @return string HTML for the header bar.
     */
    public function context_header($headerinfo = null, $headinglevel = 1) {
        $html = parent::context_header($headerinfo, $headinglevel);
        if ($headinglevel == 1) { # replace only the overarching header
            $thtml = preg_replace('/(class="page-context-header)(")/',
                                  '${1} span8${2}', $html);
            $html = isset($thtml) && !empty($thtml) ? $thtml : $html;
        }
        return $html;
    }

    public function context_logo($headerinfo = null, $headinglevel = 1) {
        $logotag = "xx";
        if ($headinglevel == 1 && !empty($this->page->theme->settings->logo)) {
            $logotag = html_writer::tag('div', '', array('class' => 'logo span4'));
        }
        return $logotag;
    }


    public function full_header() {
       $html = html_writer::start_tag('header', array('id' => 'page-header', 'class' => 'clearfix'));
       $html .= $this->context_logo();
        $html .= html_writer::start_div('span8', array('id' => 'page-navbar'));
        $html .= html_writer::tag('nav', $this->navbar(), array('class' => 'breadcrumb-nav'));
        $html .= html_writer::div($this->page_heading_button(), 'breadcrumb-button');
        $html .= html_writer::end_div();
        $html .= $this->context_header();
        $html .= html_writer::tag('div', $this->course_header(), array('id' => 'course-header'));
        $html .= html_writer::end_tag('header');
       return $html;
    }
}

?>